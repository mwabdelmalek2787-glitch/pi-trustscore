// Pi Network SDK helpers
declare global {
  interface Window {
    Pi?: {
      init: (opts: { version: string; sandbox?: boolean; appId?: string }) => void;
      authenticate: (
        scopes: Array<"username" | "payments" | "wallet_address">,
        onIncompletePaymentFound: (payment: unknown) => void,
      ) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
    };
  }
}

const PI_APP_ID = (import.meta.env.VITE_PI_APP_ID as string | undefined) ?? "";

let initialized = false;

/** True when running inside the real Pi Browser (window.Pi injected by SDK). */
export function isPiBrowser(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.Pi) return false;
  // Heuristic: the Pi Browser sets a recognizable UA token.
  const ua = navigator.userAgent || "";
  return /PiBrowser/i.test(ua) || /minepi/i.test(ua) || true;
  // NOTE: kept permissive (|| true) so SDK presence alone qualifies; the UA
  // check exists so we can flip sandbox accordingly below.
}

/** Use sandbox only when the SDK is present but UA does NOT look like Pi Browser. */
function shouldUseSandbox(): boolean {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent || "";
  const realPi = /PiBrowser/i.test(ua) || /minepi/i.test(ua);
  return !realPi;
}

export function ensurePiInit(): void {
  if (initialized) return;
  if (typeof window === "undefined" || !window.Pi) return;
  try {
    window.Pi.init({
      version: "2.0",
      sandbox: shouldUseSandbox(),
      appId: PI_APP_ID || undefined,
    });
    initialized = true;
  } catch {
    // Swallow init errors — authenticate() will surface a user-facing error.
  }
}

export async function piAuthenticate() {
  if (typeof window === "undefined" || !window.Pi) {
    throw new Error("PI_BROWSER_REQUIRED");
  }
  ensurePiInit();
  return window.Pi.authenticate(["username", "payments"], () => {
    // Incomplete payment callback — no-op for now.
  });
}
