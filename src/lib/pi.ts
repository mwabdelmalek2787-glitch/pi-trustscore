// src/lib/pi.ts
declare const Pi: any;

let piInitialized = false;

export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Check for Pi SDK global object first (most reliable)
  if (typeof Pi !== 'undefined') return true;
  const ua = navigator.userAgent;
  return /Pi Browser|PiBrowser/i.test(ua);
};

// انتظر حتى يتم تحميل Pi SDK (لمدة تصل إلى 5 ثوانٍ)
const waitForPi = (timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof Pi !== 'undefined') return resolve();
    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof Pi !== 'undefined') {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Pi SDK timeout"));
      }
    }, 100);
  });
};

export const initPi = async (): Promise<void> => {
  if (piInitialized) return;
  try {
    await waitForPi();
    Pi.init({
      version: '2.0',
      sandbox: !isPiBrowser(), // false داخل Pi Browser
    });
    piInitialized = true;
    console.log("Pi initialized, sandbox mode:", !isPiBrowser());
  } catch (err) {
    console.error("Pi init error:", err);
    throw err;
  }
};

export const authenticate = async (): Promise<any> => {
  await initPi();
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

// Aliases for compatibility
export const ensurePiInit = initPi;
export const piAuthenticate = authenticate;
