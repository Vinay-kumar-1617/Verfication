import { buildDigiLockerAuthUrl, classifyApiSetuError, type ApiSetuError, validateVehicleRequest } from '../lib/setu/client';
import { getSetuRuntimeConfig } from '../lib/setu/config';
import { invokeSupabaseFunction } from '../lib/supabase/client';

export type DigiLockerStartResult = {
  authUrl: string;
  state: string;
};

export async function startDigiLockerAuthorization(): Promise<DigiLockerStartResult> {
  const config = getSetuRuntimeConfig();

  if (!config.baseUrl || !config.clientId || !config.redirectUri || !config.digilockerAuthPath) {
    throw new Error('DigiLocker configuration is incomplete. Set the required API Setu secrets and redirect URI in the environment.');
  }

  const state = `digilocker-${Date.now()}`;
  const authUrl = buildDigiLockerAuthUrl({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    state,
    scope: 'documents',
    baseUrl: config.baseUrl,
    authPath: config.digilockerAuthPath,
  });

  const response = await invokeSupabaseFunction<{ authUrl: string; state: string }>('digilocker-start', {
    authUrl,
    state,
  });

  if (response.error) {
    const error = classifyApiSetuError({ status: 500, message: response.error.message ?? 'Unable to start DigiLocker flow.' });
    throw new Error(error.userMessage);
  }

  return {
    authUrl: response.data?.authUrl ?? authUrl,
    state: response.data?.state ?? state,
  };
}

export async function fetchDigiLockerDocuments(accessToken: string): Promise<unknown> {
  const response = await invokeSupabaseFunction('digilocker-documents', {
    accessToken,
  });

  if (response.error) {
    throw new Error(response.error.message ?? 'Unable to fetch DigiLocker documents.');
  }

  return response.data;
}

export async function submitVehicleRequest(registrationNumber: string): Promise<unknown> {
  validateVehicleRequest({ registrationNumber });
  const config = getSetuRuntimeConfig();

  if (!config.baseUrl || !config.vehicleServicePath) {
    throw new Error('Vehicle service configuration is incomplete. Set the required API Setu vehicle endpoint in the environment.');
  }

  const response = await invokeSupabaseFunction('vehicle-service', {
    registrationNumber,
    baseUrl: config.baseUrl,
    vehicleServicePath: config.vehicleServicePath,
  });

  if (response.error) {
    const error = classifyApiSetuError({ status: 500, message: response.error.message ?? 'Vehicle request failed.' });
    throw new Error(error.userMessage);
  }

  return response.data;
}

export function getSetuUiMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const typed = error as Partial<ApiSetuError>;
  return typed.userMessage ?? 'The API Setu request could not be completed.';
}
