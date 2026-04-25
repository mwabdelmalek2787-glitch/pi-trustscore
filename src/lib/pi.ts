// src/lib/pi.ts
declare const Pi: any;

let piInitialized = false;

/**
 * Detect if the app is running inside Pi Browser (more robust)
 */
export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Check for Pi SDK global object first (most reliable)
  if (typeof Pi !== 'undefined') return true;
  // Check user agent (case-insensitive, with multiple patterns)
  const ua = navigator.userAgent;
  return /Pi Browser|PiBrowser|PiBrowzer/i.test(ua);
};

export const initPi = (): void => {
  if (piInitialized) return;
  if (typeof Pi === 'undefined') {
    console.warn("Pi SDK not loaded yet.");
    return;
  }
  try {
    Pi.init({
      version: '2.0',
      sandbox: !isPiBrowser(), // false inside Pi Browser, true elsewhere
    });
    piInitialized = true;
    console.log("Pi init OK, sandbox:", !isPiBrowser());
  } catch (err) {
    console.error("Pi init error:", err);
  }
};

export const authenticate = async (): Promise<any> => {
  initPi();
  if (typeof Pi === 'undefined') {
    throw new Error("Pi SDK not loaded");
  }
  return new Promise((resolve, reject) => {
    Pi.authenticate(['username', 'payments'], (err: any, auth: any) => {
      if (err) reject(err);
      else resolve(auth);
    });
  });
};

export const getCurrentUser = (): any => {
  if (typeof Pi !== 'undefined' && Pi.currentUser) return Pi.currentUser;
  return null;
};

// Aliases for compatibility (existing code uses these names)
export const ensurePiInit = initPi;
export const piAuthenticate = authenticate;
