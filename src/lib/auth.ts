// src/lib/auth.ts
import { supabase, type ProfileRow } from "./supabase";
import { authenticate, ensurePiInit, piAuthenticate } from "./pi";

export type Profile = ProfileRow;

let currentPiUid: string | null = null;

export function getSessionPiUid(): string | null {
  return currentPiUid;
}

function setSessionPiUid(uid: string) {
  currentPiUid = uid;
}

/** Returns the profile for the in-memory session uid, or null. Does NOT trigger a Pi popup. */
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

/** Create the profile if missing, otherwise return existing. Sets session uid. */
export async function createOrUpdateProfile(
  uid: string,
  username: string,
): Promise<Profile> {
  setSessionPiUid(uid);

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();
  if (existing) return existing as Profile;

  const newProfile = {
    pi_user_id: uid,
    username,
    privacy_accepted: false,
    trust_score: 0,
  };
  const { data, error } = await supabase
    .from("profiles")
    .insert(newProfile)
    .select("*")
    .single();
  if (error) throw error;
  return data as Profile;
}

/** Alias kept for Index.tsx compatibility. */
export const upsertFromPi = createOrUpdateProfile;

export async function acceptPrivacy(): Promise<void> {
  const uid = getSessionPiUid();
  if (!uid) return;
  await supabase.rpc("accept_privacy", { _pi_user_id: uid });
}

export function clearProfile() {
  currentPiUid = null;
}

export { ensurePiInit, piAuthenticate, authenticate };
