// src/lib/auth.ts
import { supabase, type ProfileRow } from "./supabase";
import { authenticate, getCurrentUser } from "./pi";

export type Profile = ProfileRow;

let currentPiUid: string | null = null;

export async function getProfile(): Promise<Profile | null> {
  let uid = currentPiUid;
  if (!uid) {
    const user = getCurrentUser();
    if (user?.uid) uid = user.uid;
  }
  if (!uid) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();
  if (error) return null;
  return data as Profile | null;
}

export async function upsertFromPi(uid: string, username: string): Promise<Profile> {
  currentPiUid = uid;
  // Check if exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();
  if (existing) return existing as Profile;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      pi_user_id: uid,
      username,
      privacy_accepted: false,
      trust_score: 0,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function acceptPrivacy(): Promise<void> {
  const uid = currentPiUid;
  if (!uid) return;
  await supabase.rpc("accept_privacy", { pi_user_id: uid });
}
