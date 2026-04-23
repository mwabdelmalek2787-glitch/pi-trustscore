import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anon) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them as Build Secrets in Workspace Settings.",
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
