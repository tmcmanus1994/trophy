import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Null when Supabase env vars aren't set. The site still works —
 * progress just stays in localStorage on each device (syncState "local").
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const USER_KEY = process.env.NEXT_PUBLIC_USER_KEY ?? "travelle";
