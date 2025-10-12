import { Router, Request, Response } from 'express';
import IssuanceDatabase from '../db';

const router = Router();
const db = new IssuanceDatabase();

router.post('/issue', async (req: Request, res: Response) => {
  try {
    const credentialData = req.body;

    // Validate that credential data is provided
    if (!credentialData || Object.keys(credentialData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Credential data is required'
      });
    }

    const result = await db.issueCredential(credentialData);

    if (result.alreadyIssued) {
      return res.status(409).json({
        success: false,
        message: result.message,
        issuedBy: result.worker
      });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      credential: credentialData,
      issuedBy: result.worker,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error issuing credential:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'issuance' });
});

export default router;
