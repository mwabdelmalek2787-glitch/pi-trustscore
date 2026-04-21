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
    console.error("getProfile error", error);
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

export async function upsertFromPi(uid: string, username: string): Promise<Profile> {
  setSessionPiUid(uid);

  // Try to find existing first to preserve trust_score.
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();

  if (existing) return existing as Profile;

  const seed: Omit<Profile, "id" | "created_at"> = {
    pi_user_id: uid,
    username,
    privacy_accepted: false,
    trust_score: 500 + Math.floor(Math.random() * 250),
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(seed)
    .select("*")
    .single();

  if (error || !data) {
    console.error("upsertFromPi insert error", error);
    throw error ?? new Error("Failed to create profile");
  }
  return data as Profile;
}

export async function acceptPrivacy(): Promise<void> {
  const uid = getSessionPiUid();
  if (!uid) return;
  const { error } = await supabase
    .from("profiles")
    .update({ privacy_accepted: true })
    .eq("pi_user_id", uid);
  if (error) console.error("acceptPrivacy error", error);
}
