// Local-only auth + profile store (placeholder until Supabase is wired).
export type Profile = {
  id: string;
  pi_user_id: string;
  username: string;
  privacy_accepted: boolean;
  trust_score: number;
  created_at: string;
};

const KEY = "trustscore.profile";

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearProfile() {
  localStorage.removeItem(KEY);
}

export function upsertFromPi(uid: string, username: string): Profile {
  const existing = getProfile();
  if (existing && existing.pi_user_id === uid) return existing;
  const p: Profile = {
    id: crypto.randomUUID(),
    pi_user_id: uid,
    username,
    privacy_accepted: false,
    trust_score: 500 + Math.floor(Math.random() * 250),
    created_at: new Date().toISOString(),
  };
  saveProfile(p);
  return p;
}

export function acceptPrivacy() {
  const p = getProfile();
  if (!p) return;
  p.privacy_accepted = true;
  saveProfile(p);
}
