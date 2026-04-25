// src/lib/pi.ts
declare const Pi: any;

let piInitialized = false;

export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Pi Browser/i.test(navigator.userAgent);
};

export const initPi = () => {
  if (piInitialized) return;
  if (typeof Pi === 'undefined') {
    console.warn("Pi SDK not loaded yet.");
    return;
  }
  Pi.init({
    version: '2.0',
    sandbox: !isPiBrowser(), // true for regular browsers, false inside Pi Browser
  });
  piInitialized = true;
  console.log("Pi SDK initialized, sandbox:", !isPiBrowser());
};

export const authenticate = async (): Promise<any> => {
  initPi();
  if (typeof Pi === 'undefined') throw new Error("Pi SDK not loaded");
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

// Aliases for compatibility with existing code (Profile.tsx uses these names)
export const ensurePiInit = initPi;
export const piAuthenticate = authenticate;
