// Auth + profile store backed by Supabase.
import { supabase, type ProfileRow } from "./supabase";

export type Profile = ProfileRow;

const SESSION_KEY = "trustscore.pi_user_id";

function getSessionPiUid(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function setSessionPiUid(uid: string) {
  localStorage.setItem(SESSION_KEY, uid);
}

export async function getProfile(): Promise<Profile | null> {
  const uid = getSessionPiUid();
  if (!uid) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();
  if (error) {
    console.error("[auth.getProfile] error", error);
    return null;
  }
  return (data as Profile) ?? null;
}

export function clearProfile() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Ensures a profile row exists for the given Pi user.
 * Returns the existing row (preserving trust_score) or inserts a new one
 * with default values (trust_score = 0, privacy_accepted = false).
 */
async function ensureProfile(uid: string, username: string): Promise<Profile> {
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();

  if (selectError) {
    console.error("[auth.ensureProfile] select error", selectError);
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
    console.error("[auth.ensureProfile] insert error", error);
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
  const { error } = await supabase
    .from("profiles")
    .update({ privacy_accepted: true })
    .eq("pi_user_id", uid);
  if (error) console.error("[auth.acceptPrivacy] error", error);
}
