import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, createOrUpdateProfile, type Profile } from "@/lib/auth";
import { authenticate } from "@/lib/pi";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrCreate = async () => {
      try {
        let prof = await getProfile();
        if (!prof) {
          // No profile exists – let's authenticate and create one
          const auth = await authenticate();
          if (!auth?.user?.uid) throw new Error("No Pi user ID");
          prof = await createOrUpdateProfile(auth.user.uid, auth.user.username || "PiUser");
        }
        setProfile(prof);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadOrCreate();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p>Loading your Trust Score...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 text-4xl mb-2">⚠️</div>
        <p className="font-semibold">Something went wrong</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
        <h1 className="text-center text-2xl font-bold">Trust Score</h1>
        <div className="my-6 text-center">
          <div className="text-7xl font-extrabold text-orange-500">
            {profile.trust_score}
          </div>
          <p className="mt-2 text-sm text-gray-500">out of 1000</p>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Privacy accepted: {profile.privacy_accepted ? "✅ Yes" : "❌ No"}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full rounded-full bg-gray-200 py-2 text-center dark:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
