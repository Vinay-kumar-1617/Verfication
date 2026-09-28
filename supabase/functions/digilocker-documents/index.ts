import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { getRequiredEnv } from '../_shared/setu-client.ts';

serve(async (req: Request) => {
  try {
    const payload = await req.json().catch(() => ({}));
    const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : '';
    if (!accessToken) {
      throw new Error('An access token is required to retrieve DigiLocker documents.');
    }

    const baseUrl = getRequiredEnv('API_SETU_BASE_URL');
    const endpoint = `${baseUrl.replace(/\/$/, '')}/digilocker/documents`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `DigiLocker documents call failed with status ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to retrieve DigiLocker documents.';
    return new Response(JSON.stringify({ error: { message } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
