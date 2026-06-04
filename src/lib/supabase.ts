import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Module-level singletons — initialized lazily on first call
let _browserClient: SupabaseClient | null = null;

function getBrowserClient(): SupabaseClient {
  if (!_browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _browserClient = createClient(url, anonKey);
  }
  return _browserClient;
}

// Proxy so callers can write `supabase.channel(...)` etc. exactly as before
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getBrowserClient();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

// Server-side admin client — uses service role key, never exposed to client
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
