import { useState } from "react";
import { authenticate } from "@/lib/pi";
import { supabase } from "@/lib/supabase";

function App() {
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. تسجيل الدخول عبر Pi
      const auth = await authenticate();
      if (!auth?.user?.uid) throw new Error("No UID from Pi");
      const uid = auth.user.uid;
      const username = auth.user.username || "PiUser";

      // 2. البحث عن الملف الشخصي في Supabase
      let { data: profile, error: fetchErr } = await supabase
        .from("profiles")
        .select("trust_score")
        .eq("pi_user_id", uid)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!profile) {
        // إنشاء ملف شخصي جديد إذا لم يكن موجوداً
        const { data: newProfile, error: insertErr } = await supabase
          .from("profiles")
          .insert({ pi_user_id: uid, username, trust_score: 0 })
          .select("trust_score")
          .single();
        if (insertErr) throw insertErr;
        setTrustScore(newProfile.trust_score);
      } else {
        setTrustScore(profile.trust_score);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">⏳ Loading... Please check Pi Browser popup.</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (trustScore !== null) {
    return (
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold">Your Trust Score</h1>
        <div className="text-8xl font-extrabold text-orange-500 my-6">{trustScore}</div>
        <button onClick={() => setTrustScore(null)} className="bg-blue-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
    );
  }
  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold">Pi TrustScore</h1>
      <button onClick={handleLogin} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-full">
        Sign in with Pi
      </button>
    </div>
  );
}

export default App;
