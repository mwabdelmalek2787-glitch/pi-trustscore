import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.error(
    "[supabase] env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local",
  );
  if (typeof window !== "undefined") {
    // TEMP debug — remove after fix verified
    alert("[DEBUG] Supabase env vars missing. Check .env.local and restart dev server.");
  }
} else {
  // eslint-disable-next-line no-console
  console.log("[supabase] client initialised", { url });
}

export const supabase = createClient(url ?? "", anon ?? "", {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type ProfileRow = {
  id: string;
  pi_user_id: string;
  username: string;
  privacy_accepted: boolean;
  trust_score: number;
  created_at: string;
};
