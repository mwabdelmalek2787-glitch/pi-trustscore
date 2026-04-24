// Auth + profile store backed by Supabase.
// Identity is held in-memory only (no localStorage). On a hard reload the user
// must re-authenticate via Pi — this prevents trivial identity tampering from
// the browser devtools and removes a persistent PII footprint on the device.
import { supabase, type ProfileRow } from "./supabase";

export type Profile = ProfileRow;

let currentPiUid: string | null = null;

function getSessionPiUid(): string | null {
  return currentPiUid;
}

function setSessionPiUid(uid: string) {
  currentPiUid = uid;
}

export async function getProfile(): Promise<Profile | null> {
  const uid = getSessionPiUid();
  if (!uid) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();
  if (error) return null;
  return (data as Profile) ?? null;
}

export function clearProfile() {
  currentPiUid = null;
}

/**
 * Ensures a profile row exists for the given Pi user.
 */
async function ensureProfile(uid: string, username: string): Promise<Profile> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();

  if (selectError) {
    // Swallow — caller surfaces a generic error to the user.
  }

  if (existing) return existing as Profile;

  const seed: Omit<Profile, "created_at"> = {
    pi_user_id: uid,
    username,
    privacy_accepted: false,
    trust_score: 0,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(seed)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("Failed to create profile");
  }
  return data as Profile;
}

export async function upsertFromPi(uid: string, username: string): Promise<Profile> {
  setSessionPiUid(uid);
  return ensureProfile(uid, username);
}

export async function acceptPrivacy(): Promise<void> {
  const uid = getSessionPiUid();
  if (!uid) return;
  // Use the SECURITY DEFINER RPC so we don't need a broad UPDATE policy on
  // the profiles table. The function only flips `privacy_accepted` for the
  // matching pi_user_id and is the single allowed write path from anon.
  await supabase.rpc("accept_privacy", { _pi_user_id: uid });
}
