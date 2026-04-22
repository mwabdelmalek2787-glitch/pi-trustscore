import { createClient } from "@supabase/supabase-js";

// Publishable (public) keys — safe to commit. Protected by RLS.
const url = "https://qtakxhpkkijppceyzdsl.supabase.co";
const anon = "sb_publishable_zRpo5TqiHa6NJxxLQQAiAQ_jhX2EXED";

console.log("[supabase] client initialised", { url });

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
