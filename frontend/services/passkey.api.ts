import api from './api';

export interface RegisterPasskeyBeginResponse {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    authenticatorAttachment: string;
    residentKey: string;
    userVerification: string;
  };
  excludeCredentials?: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
}

export interface LoginPasskeyBeginResponse {
  challenge: string;
  timeout: number;
  rpId: string;
  allowCredentials: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
  userVerification: string;
}

export interface PasskeyCredential {
  id: string;
  deviceName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  transports: string[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    avatarUrl: string | null;
    role: {
      id: string;
      name: string;
    };
  };
}

// Registration
export const registerPasskeyBegin = async (deviceName?: string): Promise<RegisterPasskeyBeginResponse> => {
  const response = await api.post('/passkey/register/begin', { deviceName });
  return response.data;
};

export const registerPasskeyComplete = async (
  credential: any,
  deviceName?: string,
): Promise<{ success: boolean; credentialId: string; message: string }> => {
  const response = await api.post('/passkey/register/complete', {
    credential,
    deviceName,
  });
  return response.data;
};

// Authentication
export const loginPasskeyBegin = async (email: string): Promise<LoginPasskeyBeginResponse> => {
  const response = await api.post('/passkey/login/begin', { email });
  return response.data;
};

export const loginPasskeyComplete = async (
  email: string,
  credential: any,
): Promise<AuthResponse> => {
  const response = await api.post('/passkey/login/complete', {
    email,
    credential,
  });
  return response.data;
};

// Credential Management
export const getPasskeyCredentials = async (): Promise<PasskeyCredential[]> => {
  const response = await api.get('/passkey/credentials');
  return response.data;
};

export const removePasskeyCredential = async (
  credentialId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/passkey/credentials/${credentialId}`);
  return response.data;
};

export const updatePasskeyCredential = async (
  credentialId: string,
  deviceName: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.patch(`/passkey/credentials/${credentialId}`, {
    deviceName,
  });
  return response.data;
};

// Token Management
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ access_token: string; refresh_token: string; token_type: string; expires_in: number }> => {
  const response = await api.post('/passkey/refresh', { refreshToken });
  return response.data;
};

export const logoutPasskey = async (
  refreshToken: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/passkey/logout', { refreshToken });
  return response.data;
};
