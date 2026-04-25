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
  console.log("Calling Pi.authenticate with proper scopes...");
  
  // تعريف دالة رد النداء المطلوبة (حتى لو كانت فارغة)
  const onIncompletePaymentFound = (payment: any) => {
    console.log("Incomplete payment found:", payment);
    // هنا يمكن إضافة منطق لمعالجة الدفعات غير المكتملة إذا لزم الأمر
  };

  try {
    // استخدام الصيغة الموصى بها مع Promise
    const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
    console.log("Authentication successful:", auth);
    return auth;
  } catch (error) {
    console.error("Authentication failed:", error);
    throw error;
  }
};

export const getCurrentUser = (): any => {
  if (typeof Pi !== 'undefined' && Pi.currentUser) return Pi.currentUser;
  return null;
};

// Aliases for compatibility
export const ensurePiInit = initPi;
export const piAuthenticate = authenticate;
