/**
 * Session Manager Utility
 * Handles PWA vs Web session persistence with proper 7-day grace period for PWA users
 */

/**
 * Generate device fingerprint for session matching
 * Used to identify same device across app reinstalls/cache clears
 */
export const getFingerprint = () => {
  const nav = window.navigator;
  const raw = [nav.userAgent, nav.language, screen.width, screen.height, new Date().getTimezoneOffset()].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = (hash << 5) - hash + raw.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(36);
};

/**
 * Detect if app is running in PWA (standalone) mode
 */
export const isPWAMode = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

/**
 * Detect if user was previously in PWA mode by checking the persistent flag
 */
export const wasUserInPWAMode = () => {
  return !!localStorage.getItem("vrp_is_pwa");
};

/**
 * Set the PWA mode flag (call this when user logs in on PWA)
 */
export const setPWAFlag = () => {
  if (isPWAMode()) {
    localStorage.setItem("vrp_is_pwa", "1");
  }
};

/**
 * Check if PWA session has expired (7 days without opening app)
 */
export const isPWASessionExpired = () => {
  const lastSeen = localStorage.getItem("vrp_last_seen");
  if (!lastSeen) return false;
  
  const gracePeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const timeSinceLastSeen = Date.now() - parseInt(lastSeen, 10);
  
  return timeSinceLastSeen > gracePeriod;
};

/**
 * Update last_seen timestamp for PWA users (call on every app open)
 */
export const updatePWALastSeen = () => {
  if (wasUserInPWAMode()) {
    localStorage.setItem("vrp_last_seen", Date.now().toString());
  }
};

/**
 * Clear all auth data for both web and PWA
 */
export const clearAuthData = () => {
  const authKeys = [
    "userEmail",
    "userId",
    "userName",
    "deviceFingerprint",
    "luxury_cart",
    "guest_cart",
    "vrp_last_seen",
    "vrp_session_type",
    "userAvatarUrl",
  ];
  
  authKeys.forEach((key) => localStorage.removeItem(key));
};

/**
 * Check if user should be logged out
 * For Web: check sessionStorage vrp_alive
 * For PWA: check 7-day expiry based on last_seen
 */
export const shouldLogoutUser = () => {
  const staffRoleLS = localStorage.getItem("staffRole");
  const staffRoleSS = sessionStorage.getItem("staffRole");
  const isStaffSession = staffRoleLS || staffRoleSS;
  
  // Never logout staff sessions
  if (isStaffSession) return false;
  
  const wasPWA = wasUserInPWAMode();
  
  if (wasPWA) {
    // PWA user: logout only if 7-day grace period expired
    return isPWASessionExpired();
  } else {
    // Web user: logout if sessionStorage doesn't have vrp_alive
    return !sessionStorage.getItem("vrp_alive");
  }
};

/**
 * Mark web session as alive (for tab/browser users)
 */
export const markWebSessionAlive = () => {
  if (!wasUserInPWAMode()) {
    sessionStorage.setItem("vrp_alive", "1");
  }
};

/**
 * Get the appropriate storage for Supabase based on environment
 * Web: sessionStorage (cleared on tab close)
 * PWA: localStorage (persists across app closes)
 * 
 * Note: Called at module load time, so checks both current mode and persistent flag
 */
export const getSupabaseStorage = () => {
  // Check current mode or persistent flag (covers both first load and return visits)
  const currentPWA = isPWAMode();
  const wasPWA = wasUserInPWAMode();
  
  if (currentPWA || wasPWA) {
    return window.localStorage;
  }
  return window.sessionStorage;
};
