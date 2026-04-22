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

// TODO: replace with the real Pi App ID once provided.
const PI_APP_ID = (import.meta.env.VITE_PI_APP_ID as string | undefined) ?? "";
const SANDBOX = true;

let initialized = false;

export function isPiBrowser() {
  return typeof window !== "undefined" && !!window.Pi;
}

export function ensurePiInit() {
  if (!isPiBrowser() || initialized) return;
  try {
    window.Pi!.init({ version: "2.0", sandbox: SANDBOX, appId: PI_APP_ID || undefined });
    initialized = true;
  } catch (e) {
    console.error("Pi.init failed", e);
  }
}

export async function piAuthenticate() {
  if (!isPiBrowser()) {
    const err = new Error("PI_BROWSER_REQUIRED");
    console.error("[pi] window.Pi not found — must be opened in Pi Browser");
    throw err;
  }
  ensurePiInit();
  return window.Pi!.authenticate(["username", "payments"], (payment) => {
    console.warn("[pi] Incomplete payment found", payment);
  });
}
