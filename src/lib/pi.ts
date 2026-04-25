// src/lib/pi.ts
declare const Pi: any;

let piInitialized = false;

export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Pi Browser|PiBrowser/i.test(ua);
};

// انتظر تحميل SDK بشكل كامل
const waitForPi = (timeout = 8000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof Pi !== 'undefined' && Pi.init) {
      return resolve();
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (typeof Pi !== 'undefined' && Pi.init) {
        clearInterval(interval);
        resolve();
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Pi SDK not loaded"));
      }
    }, 100);
  });
};

export const initPi = async (): Promise<void> => {
  if (piInitialized) return;
  try {
    await waitForPi();
    console.log("Pi SDK ready, calling Pi.init...");
    // Force sandbox = true للاختبار (حتى داخل Pi Browser)
    Pi.init({
      version: '2.0',
      sandbox: true,   // تغيير مؤقت لضمان عمل المصادقة في وضع الاختبار
    });
    piInitialized = true;
    console.log("Pi.init completed successfully");
  } catch (err) {
    console.error("Pi init error:", err);
    throw err;
  }
};

export const authenticate = async (): Promise<any> => {
  await initPi();
  console.log("Calling Pi.authenticate...");
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error("Authentication timeout. Check Developer Portal settings."));
    }, 20000);

    Pi.authenticate(['username'], (err: any, auth: any) => {
      clearTimeout(timeoutId);
      if (err) {
        console.error("Auth error:", err);
        reject(err);
      } else {
        console.log("Auth success:", auth);
        resolve(auth);
      }
    });
  });
};

export const getCurrentUser = (): any => {
  return Pi?.currentUser || null;
};

// Aliases
export const ensurePiInit = initPi;
export const piAuthenticate = authenticate;
