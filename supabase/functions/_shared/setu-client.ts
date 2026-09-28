export type SetuRequestOptions = {
  method?: string;
  path: string;
  body?: Record<string, unknown> | null;
  headers?: Record<string, string>;
};

export function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required server-side configuration: ${name}`);
  }
  return value.trim();
}

export function redactValue(value: string): string {
  if (!value || value.length <= 4) return '***';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

export function safeLog(message: string, details: Record<string, string | undefined> = {}): void {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(details)) {
    sanitized[key] = value ? redactValue(value) : 'not-set';
  }
  console.log(message, JSON.stringify(sanitized));
}

export async function callSetuApi<T>({ method = 'POST', path, body, headers = {} }: SetuRequestOptions): Promise<T> {
  const baseUrl = getRequiredEnv('API_SETU_BASE_URL');
  const endpoint = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const authHeaderName = Deno.env.get('API_SETU_AUTH_HEADER_NAME') ?? 'Authorization';
  const authHeaderValue = Deno.env.get('API_SETU_AUTH_HEADER_VALUE') ?? '';

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };

  if (authHeaderName && authHeaderValue) {
    requestHeaders[authHeaderName] = authHeaderValue;
  }

  const response = await fetch(endpoint, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.message ?? payload?.error?.message ?? `API Setu call failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
