// localStorage-based storage adapter
// Mirrors the MMKV API used in the mobile app so all service code can be shared.

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth.token',
  AUTH_USER: 'auth.user',
  MAIN_ADMIN_BRANCH_CONTEXT: 'mainAdmin.branchContext',
  OTP_VERIFICATION_ID: 'auth.otpVerificationId',
  ACTIVE_CHILD_ID: 'parent.activeChildId',
};

export const storage = {
  getString(key) {
    try { return localStorage.getItem(key) ?? undefined; } catch { return undefined; }
  },
  set(key, value) {
    try { localStorage.setItem(key, String(value)); } catch { /* ignore */ }
  },
  delete(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
  contains(key) {
    try { return localStorage.getItem(key) !== null; } catch { return false; }
  },
};

export const getJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const setJSON = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

export const removeStorageKeys = (keys) => {
  keys.forEach((k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
};
