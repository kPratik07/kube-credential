// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';
const ISSUANCE_PORT = import.meta.env.VITE_ISSUANCE_PORT || '3001';
const VERIFICATION_PORT = import.meta.env.VITE_VERIFICATION_PORT || '3002';

const ISSUANCE_URL = `${API_BASE_URL}:${ISSUANCE_PORT}/api`;
const VERIFICATION_URL = `${API_BASE_URL}:${VERIFICATION_PORT}/api`;

// Types
export interface Credential {
  name: string;
  email: string;
  course: string;
}

export interface IssueResponse {
  success: boolean;
  message: string;
  credential?: Credential;
  issuedBy?: string;
  timestamp?: string;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  valid: boolean;
  message: string;
  issuedBy?: string;
  issuedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  error?: string;
}

export interface VerificationRecord {
  id: number;
  credential_data: string;
  verified_by: string;
  verified_at: string;
  is_valid: number;
  issued_by?: string | null;
  issued_at?: string | null;
}

export interface HistoryResponse {
  success: boolean;
  history: VerificationRecord[];
  error?: string;
}

// API Functions
export const issueCredential = async (credential: Credential): Promise<IssueResponse> => {
  try {
    const response = await fetch(`${ISSUANCE_URL}/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credential),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error issuing credential:', error);
    return {
      success: false,
      message: 'Failed to connect to issuance service',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const verifyCredential = async (credential: Credential): Promise<VerifyResponse> => {
  try {
    const response = await fetch(`${VERIFICATION_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credential),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying credential:', error);
    return {
      success: false,
      valid: false,
      message: 'Failed to connect to verification service',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getVerificationHistory = async (): Promise<HistoryResponse> => {
  try {
    const response = await fetch(`${VERIFICATION_URL}/history`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching verification history:', error);
    return {
      success: false,
      history: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const checkHealth = async (service: 'issuance' | 'verification'): Promise<boolean> => {
  try {
    const url = service === 'issuance' ? ISSUANCE_URL : VERIFICATION_URL;
    const response = await fetch(`${url}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error(`Error checking ${service} health:`, error);
    return false;
  }
};
