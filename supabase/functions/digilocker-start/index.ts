import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { getRequiredEnv, safeLog } from '../_shared/setu-client.ts';

serve(async (req: Request) => {
  try {
    const payload = await req.json().catch(() => ({}));
    const env = {
      baseUrl: getRequiredEnv('API_SETU_BASE_URL'),
      clientId: getRequiredEnv('API_SETU_CLIENT_ID'),
      redirectUri: Deno.env.get('DIGILOCKER_REDIRECT_URI') ?? '',
      digilockerPath: Deno.env.get('API_SETU_DIGILOCKER_AUTH_PATH') ?? '/digilocker/authorize',
    };

    if (!env.redirectUri) {
      throw new Error('DIGILOCKER_REDIRECT_URI is required in Supabase secrets for the DigiLocker callback.');
    }

    const state = typeof payload.state === 'string' ? payload.state : `digilocker-${Date.now()}`;
    const authUrl = `${env.baseUrl.replace(/\/$/, '')}${env.digilockerPath.startsWith('/') ? env.digilockerPath : `/${env.digilockerPath}`}?client_id=${encodeURIComponent(env.clientId)}&redirect_uri=${encodeURIComponent(env.redirectUri)}&state=${encodeURIComponent(state)}&scope=documents`;

    safeLog('DigiLocker auth URL generated', {
      baseUrl: env.baseUrl,
      clientId: env.clientId,
      redirectUri: env.redirectUri,
    });

    return new Response(JSON.stringify({ authUrl, state }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate DigiLocker authorization URL.';
    return new Response(JSON.stringify({ error: { message } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
