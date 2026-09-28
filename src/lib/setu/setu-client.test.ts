import { describe, expect, it } from 'vitest';
import {
  buildDigiLockerAuthUrl,
  classifyApiSetuError,
  parseSetuError,
  validateVehicleRequest,
} from './client';

describe('API Setu client helpers', () => {
  it('builds a valid DigiLocker auth URL', () => {
    const url = buildDigiLockerAuthUrl({
      clientId: 'demo-client',
      redirectUri: 'myapp://digilocker-callback',
      state: 'abc123',
      scope: 'documents',
      baseUrl: 'https://sandbox-api.setu.co',
    });

    expect(url).toContain('https://sandbox-api.setu.co/digilocker/authorize');
    expect(url).toContain('client_id=demo-client');
    expect(url).toContain('redirect_uri=myapp%3A%2F%2Fdigilocker-callback');
    expect(url).toContain('state=abc123');
  });

  it('classifies authentication failures', () => {
    const result = classifyApiSetuError({ status: 401, message: 'Invalid credentials' });
    expect(result.code).toBe('AUTHENTICATION_FAILED');
    expect(result.userMessage).toContain('authentication');
  });

  it('classifies rate-limit failures', () => {
    const result = classifyApiSetuError({ status: 429, message: 'Too many requests' });
    expect(result.code).toBe('RATE_LIMITED');
  });

  it('validates vehicle service input', () => {
    expect(() => validateVehicleRequest({ registrationNumber: 'KA01AB1234' })).not.toThrow();
    expect(() => validateVehicleRequest({ registrationNumber: '' })).toThrow();
  });

  it('parses a Setu error payload', () => {
    const error = parseSetuError({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Registration number is missing',
      },
    });

    expect(error.code).toBe('INVALID_REQUEST');
    expect(error.message).toContain('Registration number');
  });
});
