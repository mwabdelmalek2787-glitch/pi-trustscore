// src/lib/auth.ts
import { supabase, type ProfileRow } from "./supabase";
import { authenticate, getCurrentUser, ensurePiInit, piAuthenticate } from "./pi";

export type Profile = ProfileRow;

let currentPiUid: string | null = null;

function getSessionPiUid(): string | null {
  return currentPiUid;
}

function setSessionPiUid(uid: string) {
  currentPiUid = uid;
}

// ✅ سيتم استدعاء هذه الدالة للحصول على البروفايل، مع محاولة تسجيل الدخول أولاً
export async function getProfile(): Promise<Profile | null> {
  let uid = getSessionPiUid();

  // if no cached uid, try to authenticate with Pi
  if (!uid) {
    try {
      const auth = await authenticate();
      if (!auth?.user?.uid) {
        console.warn("Authentication succeeded but no uid");
        return null;
      }
      uid = auth.user.uid;
      setSessionPiUid(uid);
    } catch (err) {
      console.error("Authentication failed:", err);
      return null;
    }
  }

  // now fetch profile from Supabase
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("pi_user_id", uid)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    return null;
  }
  if (!data) {
    // no profile yet – we should create one on the fly
    return null;
  }
  return data as Profile;
}

export async function createOrUpdateProfile(uid: string, username: string): Promise<Profile> {
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

export async function acceptPrivacy(): Promise<void> {
  const uid = getSessionPiUid();
  if (!uid) return;
  await supabase.rpc("accept_privacy", { pi_user_id: uid });
}

// clean session (logout)
export function clearProfile() {
  currentPiUid = null;
}

// re-export for compatibility with old imports
export { ensurePiInit, piAuthenticate };
