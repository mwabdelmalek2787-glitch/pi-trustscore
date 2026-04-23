import { createClient } from "@supabase/supabase-js";

// Publishable (public) keys — safe to expose. Protected by RLS.
const FALLBACK_URL = "https://qtakxhpkkijppceyzdsl.supabase.co";
const FALLBACK_ANON = "sb_publishable_zRpo5TqiHa6NJxxLQQAiAQ_jhX2EXED";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? FALLBACK_URL;
const anon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? FALLBACK_ANON;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set — using fallback values. " +
      "Add them as Build Secrets in Workspace Settings.",
  );
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type ProfileRow = {
  pi_user_id: string;
  username: string;
  trust_score: number;
  created_at: string;
  privacy_accepted: boolean;
};
