// src/lib/pi.ts

declare const Pi: any;

let piInitialized = false;

/**
 * Detect if the app is running inside Pi Browser
 */
export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Pi Browser/i.test(navigator.userAgent);
};

/**
 * Initialize Pi SDK once
 */
export const initPi = (): void => {
  if (piInitialized) return;
  if (typeof Pi === 'undefined') {
    console.warn("Pi SDK not loaded yet. Make sure Pi script is included.");
    return;
  }

  try {
    Pi.init({
      version: '2.0',
      // Use sandbox only in regular browsers; inside Pi Browser use real mode (sandbox: false)
      sandbox: !isPiBrowser(),
    });
    piInitialized = true;
    console.log("Pi SDK initialized, sandbox mode:", !isPiBrowser());
  } catch (error) {
    console.error("Failed to initialize Pi SDK:", error);
  }
};

/**
 * Authenticate with Pi
 * @returns Promise with auth object
 */
export const authenticate = async (): Promise<any> => {
  initPi();
  if (typeof Pi === 'undefined') {
    throw new Error("Pi SDK not available");
  }

  return new Promise((resolve, reject) => {
    Pi.authenticate(['username', 'payments'], (err: any, auth: any) => {
      if (err) reject(err);
      else resolve(auth);
    });
  });
};

/**
 * Get current user from Pi (if already authenticated)
 */
export const getCurrentUser = (): any => {
  if (typeof Pi !== 'undefined' && Pi.currentUser) {
    return Pi.currentUser;
  }
  return null;
};
