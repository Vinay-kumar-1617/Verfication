export type ApiSetuErrorPayload = {
  status?: number;
  message?: string;
  code?: string;
  error?: {
    code?: string;
    message?: string;
  };
  details?: unknown;
};

export type DigiLockerAuthRequest = {
  clientId: string;
  redirectUri: string;
  state: string;
  scope?: string;
  baseUrl: string;
  authPath?: string;
};

export type VehicleRequestInput = {
  registrationNumber: string;
  [key: string]: string | undefined;
};

export type ApiSetuError = {
  code: string;
  status: number;
  message: string;
  userMessage: string;
};

export function buildDigiLockerAuthUrl({
  clientId,
  redirectUri,
  state,
  scope = 'documents',
  baseUrl,
  authPath = '/digilocker/authorize',
}: DigiLockerAuthRequest): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope,
  });

  return `${baseUrl.replace(/\/$/, '')}${authPath.startsWith('/') ? authPath : `/${authPath}`}?${params.toString()}`;
}

export function parseSetuError(payload: ApiSetuErrorPayload): { code: string; message: string } {
  const code = payload.error?.code ?? payload.code ?? 'UNKNOWN_ERROR';
  const message = payload.error?.message ?? payload.message ?? 'API Setu request failed.';
  return { code, message };
}

export function classifyApiSetuError(payload: ApiSetuErrorPayload): ApiSetuError {
  const { code, message } = parseSetuError(payload);
  const status = payload.status ?? 500;

  if (status === 401 || /auth|token|unauthorized|invalid_credentials/i.test(code + ' ' + message)) {
    return {
      code: 'AUTHENTICATION_FAILED',
      status,
      message,
      userMessage: 'authentication with API Setu failed. Please retry or check the configured credentials.',
    };
  }

  if (status === 429 || /rate limit|too many requests/i.test(code + ' ' + message)) {
    return {
      code: 'RATE_LIMITED',
      status,
      message,
      userMessage: 'API Setu is rate limiting requests. Please try again in a moment.',
    };
  }

  if (status === 400 || /invalid_request|validation/i.test(code + ' ' + message)) {
    return {
      code: 'INVALID_REQUEST',
      status,
      message,
      userMessage: 'The request payload is invalid. Please check the values and try again.',
    };
  }

  return {
    code: code || 'UNKNOWN_ERROR',
    status,
    message,
    userMessage: 'API Setu is temporarily unavailable. Please try again later.',
  };
}

export function validateVehicleRequest(input: VehicleRequestInput): void {
  const registrationNumber = (input.registrationNumber ?? '').trim();

  if (!registrationNumber) {
    throw new Error('Registration number is required.');
  }

  if (registrationNumber.length < 5) {
    throw new Error('Registration number is too short.');
  }
}
