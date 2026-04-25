// src/lib/pi.ts
declare global {
  interface Window {
    Pi?: any;
  }
}

let piInitialized = false;
let initPromise: Promise<void> | null = null;

export const isPiBrowser = (): boolean => {
  if (typeof window === "undefined") return false;
  return /(PiBrowser|Pi Browser|minepi)/i.test(navigator.userAgent);
};

/** Wait until window.Pi is loaded (script tag in index.html). */
export const waitForPiSdk = (timeoutMs = 8000): Promise<any> =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    if (window.Pi) return resolve(window.Pi);
    const start = Date.now();
    const id = setInterval(() => {
      if (window.Pi) {
        clearInterval(id);
        resolve(window.Pi);
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(id);
        reject(new Error("Pi SDK failed to load"));
      }
    }, 100);
  });

export const initPi = async (): Promise<void> => {
  if (piInitialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const Pi = await waitForPiSdk();
    Pi.init({ version: "2.0", sandbox: !isPiBrowser() });
    piInitialized = true;
    console.log("[pi] initialized, sandbox:", !isPiBrowser());
  })();
  return initPromise;
};

const onIncompletePaymentFound = (_payment: unknown) => {
  // No-op for Phase 1 (no payments scope yet).
};

export const authenticate = async (): Promise<any> => {
  await initPi();
  const Pi = window.Pi;
  if (!Pi) throw new Error("Pi SDK not available");

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Pi authentication timeout")),
      30000,
    );
    try {
      const result = Pi.authenticate(["username"], onIncompletePaymentFound);
      // SDK v2 returns a Promise; older signatures used callback.
      if (result && typeof result.then === "function") {
        result
          .then((auth: any) => {
            clearTimeout(timeout);
            resolve(auth);
          })
          .catch((err: any) => {
            clearTimeout(timeout);
            reject(err);
          });
      }
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
};

export const getCurrentUser = (): any => {
  if (typeof window !== "undefined" && window.Pi?.currentUser) {
    return window.Pi.currentUser;
  }
  return null;
};

// Aliases kept for compatibility.
export const ensurePiInit = initPi;
export const piAuthenticate = authenticate;
