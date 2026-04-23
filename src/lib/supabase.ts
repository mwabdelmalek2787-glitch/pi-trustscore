import { createClient } from "@supabase/supabase-js";

// ⚠️ TEMPORARY: Hardcoded for mobile testing.
// TODO: Move to Workspace Settings → Build Secrets and switch back to
// import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const url = "https://qtakxhpkkijppceyzdsl.supabase.co";
const anon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0YWt4aHBra2lqcHBjZXl6ZHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDg1NDUsImV4cCI6MjA5MjM4NDU0NX0.b2syIsp0PJW_uUbLxFN-sdBWKwUAqd-3xdSwIhQdyXg";

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
