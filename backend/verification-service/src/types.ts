export interface VerificationRecord {
  id: number;
  credential_data: string;
  verified_by: string;
  verified_at: string;
  is_valid: number;
  issued_by?: string | null;
  issued_at?: string | null;
}

export interface VerificationResult {
  valid: boolean;
  message: string;
  issuedBy?: string;
  issuedAt?: string;
  verifiedBy: string;
  verifiedAt: string;
}
