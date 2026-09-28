import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { callSetuApi, getRequiredEnv, safeLog } from '../_shared/setu-client.ts';

type VehicleServicePayload = {
  registrationNumber?: string;
  baseUrl?: string;
  vehicleServicePath?: string;
};

type VehicleResponse = {
  status?: string;
  transactionId?: string;
  referenceId?: string;
  data?: unknown;
  error?: {
    code?: string;
    message?: string;
  };
};

serve(async (req: Request) => {
  try {
    const payload = (await req.json().catch(() => ({}))) as VehicleServicePayload;
    const registrationNumber = String(payload.registrationNumber ?? '').trim();

    if (!registrationNumber || registrationNumber.length < 5) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_REQUEST', message: 'Registration number is required and must be valid.' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const baseUrl = payload.baseUrl ?? getRequiredEnv('API_SETU_BASE_URL');
    const vehicleServicePath = payload.vehicleServicePath ?? getRequiredEnv('API_SETU_VEHICLE_PATH');
    const apiKey = Deno.env.get('API_SETU_API_KEY') ?? '';

    safeLog('Vehicle request received', {
      registrationNumber,
      baseUrl,
      vehicleServicePath,
      apiKey,
    });

    const body = {
      registrationNumber,
    };

    const response = await callSetuApi<VehicleResponse>({
      method: 'POST',
      path: vehicleServicePath,
      body,
      headers: {
        'x-api-key': apiKey,
      },
    });

    return new Response(JSON.stringify({
      status: response.status ?? 'success',
      transactionId: response.transactionId ?? response.referenceId ?? null,
      referenceId: response.referenceId ?? response.transactionId ?? null,
      data: response.data ?? response,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Vehicle service request failed.';
    return new Response(JSON.stringify({ error: { message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
