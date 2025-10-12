import initSqlJs, { Database } from 'sql.js';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export interface Credential {
  id: string;
  data: string;
  issuedBy: string;
  issuedAt: string;
}

class IssuanceDatabase {
  private db: Database | null = null;
  private dbPath: string;
  private initialized: boolean = false;

  constructor(dbPath: string = './data/issuance.db') {
    this.dbPath = dbPath;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized && this.db) return;

    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    // Create table if not exists
    this.db.run(`
      CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        issued_by TEXT NOT NULL,
        issued_at TEXT NOT NULL
      )
    `);

    this.save();
    this.initialized = true;
  }

  private save(): void {
    if (!this.db) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.dbPath, buffer);
  }

  public async issueCredential(credentialData: any): Promise<{ success: boolean; message: string; worker: string; alreadyIssued: boolean }> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const credentialId = JSON.stringify(credentialData);
    const workerId = os.hostname();

    // Check if credential already exists
    const stmt = this.db.prepare('SELECT * FROM credentials WHERE id = ?');
    stmt.bind([credentialId]);
    const existing = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    
    if (existing) {
      return {
        success: false,
        message: 'Credential already issued',
        worker: existing.issued_by as string,
        alreadyIssued: true
      };
    }

    // Issue new credential
    const issuedAt = new Date().toISOString();
    this.db.run(
      'INSERT INTO credentials (id, data, issued_by, issued_at) VALUES (?, ?, ?, ?)',
      [credentialId, JSON.stringify(credentialData), workerId, issuedAt]
    );

    this.save();

    return {
      success: true,
      message: `credential issued by ${workerId}`,
      worker: workerId,
      alreadyIssued: false
    };
  }

  public async getCredential(credentialData: any): Promise<Credential | null> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const credentialId = JSON.stringify(credentialData);
    const stmt = this.db.prepare('SELECT * FROM credentials WHERE id = ?');
    stmt.bind([credentialId]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    
    if (!row) return null;

    return {
      id: row.id as string,
      data: row.data as string,
      issuedBy: row.issued_by as string,
      issuedAt: row.issued_at as string
    };
  }

  public close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

export default IssuanceDatabase;
