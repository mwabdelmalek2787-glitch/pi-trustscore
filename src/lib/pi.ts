// src/lib/pi.ts
declare const Pi: any;

let piInitialized = false;

export const isPiBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  if (typeof Pi !== 'undefined') return true;
  const ua = navigator.userAgent;
  return /Pi Browser|PiBrowser/i.test(ua);
};

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
      sandbox: !isPiBrowser(),
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
  console.log("Calling Pi.authenticate...");
  return new Promise((resolve, reject) => {
    let resolved = false;

    // مهلة 20 ثانية في حال عدم استجابة الـ SDK
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        console.error("Pi.authenticate timeout");
        reject(new Error("Login timeout. Please check your Pi Browser and domain settings."));
      }
    }, 20000);

    Pi.authenticate(['username'], (err: any, auth: any) => {
      resolved = true;
      clearTimeout(timeoutId);
      console.log("Pi.authenticate callback:", err ? "Error" : "Success");
      if (err) reject(err);
      else resolve(auth);
    });
  });
};

export const getCurrentUser = (): any => {
  if (typeof Pi !== 'undefined' && Pi.currentUser) return Pi.currentUser;
  return null;
};

// these two lines are REQUIRED by the old code in auth.ts and Profile.tsx
export const ensurePiInit = initPi;
export const piAuthenticate = authenticate;
