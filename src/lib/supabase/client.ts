import { createClient } from '@supabase/supabase-js';

export type SupabaseFunctionResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export async function invokeSupabaseFunction<T>(
  functionName: string,
  body: Record<string, unknown> = {},
): Promise<SupabaseFunctionResult<T>> {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return supabase.functions.invoke<T>(functionName, { body });
}

export function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
