import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { getRequiredEnv, safeLog } from '../_shared/setu-client.ts';

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const code = params.code ?? '';
    const state = params.state ?? '';
    const error = params.error ?? '';

    if (error) {
      return new Response(JSON.stringify({ error: { code: 'AUTHORIZATION_FAILED', message: error } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!code || !state) {
      throw new Error('DigiLocker callback did not include the required authorization code or state parameter.');
    }

    const baseUrl = getRequiredEnv('API_SETU_BASE_URL');
    const clientId = getRequiredEnv('API_SETU_CLIENT_ID');
    const clientSecret = getRequiredEnv('API_SETU_CLIENT_SECRET');

    safeLog('DigiLocker callback received', {
      baseUrl,
      clientId,
      state,
    });

    return new Response(JSON.stringify({
      ok: true,
      authCode: code,
      state,
      message: 'Authorization callback received. Exchange this code with API Setu according to the official DigiLocker specification.',
      requiresManualConfirmation: true,
      clientSecretProvided: Boolean(clientSecret),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process DigiLocker callback.';
    return new Response(JSON.stringify({ error: { message } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
