export type SetuApiErrorCode =
  | 'AUTHENTICATION_FAILED'
  | 'INVALID_REQUEST'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR';

export type SetuApiErrorResponse = {
  code?: string;
  message?: string;
  status?: number;
  userMessage?: string;
};

export type DigiLockerSession = {
  id?: string;
  userId?: string;
  state: string;
  authCode?: string;
  redirectUri?: string;
  status: 'pending' | 'authorized' | 'failed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleRequestRecord = {
  id?: string;
  userId?: string;
  registrationNumber: string;
  referenceId?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt?: string;
  updatedAt?: string;
};

export type ApiTransactionRecord = {
  id?: string;
  userId?: string;
  service: 'digilocker' | 'vehicle';
  referenceId?: string;
  status: 'pending' | 'success' | 'failed';
  createdAt?: string;
  updatedAt?: string;
};
