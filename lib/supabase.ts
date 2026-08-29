import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté navigateur (clé anon). La lecture du catalogue
 * est publique via RLS ; toute écriture sur les commandes est réservée
 * aux Edge Functions (service role).
 */
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}
