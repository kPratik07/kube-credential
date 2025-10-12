import initSqlJs, { Database } from 'sql.js';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { VerificationRecord, VerificationResult } from './types';

class VerificationDatabase {
  private db: Database | null = null;
  private dbPath: string;
  private initialized: boolean = false;

  constructor(dbPath: string = './data/verification.db') {
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
      CREATE TABLE IF NOT EXISTS verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credential_data TEXT NOT NULL,
        verified_by TEXT NOT NULL,
        verified_at TEXT NOT NULL,
        is_valid INTEGER NOT NULL,
        issued_by TEXT,
        issued_at TEXT
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

  public async recordVerification(
    credentialData: any,
    isValid: boolean,
    issuedBy?: string,
    issuedAt?: string
  ): Promise<VerificationResult> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const workerId = os.hostname();
    const verifiedAt = new Date().toISOString();

    this.db.run(
      `INSERT INTO verifications (credential_data, verified_by, verified_at, is_valid, issued_by, issued_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        JSON.stringify(credentialData),
        workerId,
        verifiedAt,
        isValid ? 1 : 0,
        issuedBy || null,
        issuedAt || null
      ]
    );

    this.save();

    return {
      valid: isValid,
      message: isValid ? 'Credential is valid' : 'Credential not found or invalid',
      issuedBy,
      issuedAt,
      verifiedBy: workerId,
      verifiedAt
    };
  }

  public async getVerificationHistory(limit: number = 10): Promise<VerificationRecord[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM verifications
      ORDER BY verified_at DESC
      LIMIT ?
    `);
    stmt.bind([limit]);

    const results: VerificationRecord[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as number,
        credential_data: row.credential_data as string,
        verified_by: row.verified_by as string,
        verified_at: row.verified_at as string,
        is_valid: row.is_valid as number,
        issued_by: row.issued_by as string | null,
        issued_at: row.issued_at as string | null
      });
    }
    stmt.free();

    return results;
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

export default VerificationDatabase;
