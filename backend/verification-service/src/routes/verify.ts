import { Router, Request, Response } from 'express';
import VerificationDatabase from '../db';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();
const db = new VerificationDatabase();

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const credentialData = req.body;

    // Validate that credential data is provided
    if (!credentialData || Object.keys(credentialData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Credential data is required'
      });
    }

    // Check if credential exists in shared volume (Kubernetes) or local path (Docker Compose)
    // In production K8s, both services would share a persistent volume or use a shared database
    const sharedDbPath = process.env.SHARED_DB_PATH || path.join(__dirname, '../../../issuance-service/data/issuance.db');
    
    let issuedCredential = null;
    
    // Try to access shared issuance database
    if (fs.existsSync(sharedDbPath)) {
      try {
        const initSqlJs = (await import('sql.js')).default;
        const SQL = await initSqlJs();
        const buffer = fs.readFileSync(sharedDbPath);
        const issuanceDb = new SQL.Database(buffer);
        
        const credentialId = JSON.stringify(credentialData);
        const stmt = issuanceDb.prepare('SELECT * FROM credentials WHERE id = ?');
        stmt.bind([credentialId]);
        const row = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        issuanceDb.close();
        
        if (row) {
          issuedCredential = {
            id: row.id as string,
            data: row.data as string,
            issuedBy: row.issued_by as string,
            issuedAt: row.issued_at as string
          };
        }
      } catch (dbError) {
        console.error('Error accessing issuance database:', dbError);
      }
    }

    let result;
    if (issuedCredential) {
      result = await db.recordVerification(
        credentialData,
        true,
        issuedCredential.issuedBy,
        issuedCredential.issuedAt
      );
      
      return res.status(200).json({
        success: true,
        ...result
      });
    } else {
      result = await db.recordVerification(credentialData, false);
      
      return res.status(404).json({
        success: false,
        ...result
      });
    }
  } catch (error) {
    console.error('Error verifying credential:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'verification' });
});

router.get('/history', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await db.getVerificationHistory(limit);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
