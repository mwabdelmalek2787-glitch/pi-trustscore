// Deterministic mock data for ratings + 6-month evolution.
export type Rating = {
  id: string;
  rater: string;
  delta: number;
  comment: string;
  date: string;
};

const COMMENTS = [
  "Reliable trader, smooth experience.",
  "Quick response, fair deal.",
  "Slow to reply but completed.",
  "Excellent communication.",
  "Did not honor agreement.",
  "Trustworthy and friendly.",
];

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >> 17; h >>>= 0;
    h ^= h << 5;  h >>>= 0;
    return (h % 1000) / 1000;
  };
}

export function recentRatings(seed: string): Rating[] {
  const rnd = seeded(seed + "r");
  const out: Rating[] = [];
  const now = Date.now();
  for (let i = 0; i < 5; i++) {
    const r = rnd();
    const delta = Math.round((r - 0.45) * 60);
    out.push({
      id: `${i}`,
      rater: ["pi_alex", "moon_lee", "sara99", "kai_dev", "nora.x"][i],
      delta,
      comment: COMMENTS[Math.floor(rnd() * COMMENTS.length)],
      date: new Date(now - i * 86400000 * 2).toISOString(),
    });
  }
  return out;
}

export function scoreHistory(seed: string, current: number) {
  const rnd = seeded(seed + "h");
  const points: { month: string; score: number }[] = [];
  const keys = ["jul", "aug", "sep", "oct", "nov", "dec"];
  let s = current - 80;
  for (const k of keys) {
    s += Math.round((rnd() - 0.4) * 40);
    s = Math.max(0, Math.min(1000, s));
    points.push({ month: k, score: s });
  }
  // make last point match current
  points[points.length - 1].score = current;
  return points;
}

export function aiSentiment(seed: string) {
  // 0..1 — deterministic per user
  const rnd = seeded(seed + "ai");
  return rnd();
}
