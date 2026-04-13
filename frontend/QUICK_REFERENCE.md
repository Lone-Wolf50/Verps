## PWA Session Persistence - Quick Reference

### Import the Session Manager
```javascript
import {
  wasUserInPWAMode,
  isPWASessionExpired,
  updatePWALastSeen,
  shouldLogoutUser,
  markWebSessionAlive,
  isPWAMode,
  setPWAFlag,
  clearAuthData,
  getSupabaseStorage,
} from "../../utils/sessionManager";
```

### Common Usage Patterns

#### **1. Check if User Should Be Logged Out**
```javascript
if (shouldLogoutUser()) {
  // User timed out or session invalid
  // Clear data and force login
  clearAuthData();
  navigate("/login");
}
```

#### **2. Update PWA Session on Interaction**
```javascript
useEffect(() => {
  if (!wasUserInPWAMode()) return; // Only PWA
  
  const update = () => updatePWALastSeen();
  
  document.addEventListener("click", update);
  return () => document.removeEventListener("click", update);
}, []);
```

#### **3. Detect Environment**
```javascript
if (isPWAMode()) {
  // Running in standalone PWA mode
  console.log("This is a PWA!");
}

if (wasUserInPWAMode()) {
  // Was installed as PWA (persistent flag)
  console.log("User previously had PWA installed");
}
```

#### **4. Handle Page Hide (Logout on Close)**
```javascript
useEffect(() => {
  const onPageHide = (e) => {
    if (!e.persisted) {
      // Only delete for web users, not PWA
      if (!wasUserInPWAMode()) {
        // Delete session from Supabase
        supabase.from("verp_sessions").delete()
          .match({ user_id: uid, device_fingerprint: fp });
      }
    }
  };
  window.addEventListener("pagehide", onPageHide);
  return () => window.removeEventListener("pagehide", onPageHide);
}, []);
```

#### **5. Session Restoration on App Open**
```javascript
// In Paths.jsx or main app initialization
if (!localStorage.getItem("userEmail")) {
  // No local auth, but check if PWA has active session
  if (wasUserInPWAMode()) {
    try {
      const { data: session } = await supabase
        .from("verp_sessions")
        .select("user_id")
        .limit(1)
        .single();
      
      if (session) {
        // Restore user from Supabase
        const { data: user } = await supabase
          .from("verp_users")
          .select("*")
          .eq("id", session.user_id)
          .single();
        
        // Re-populate localStorage
        localStorage.setItem("userEmail", user.email);
        // ...
      }
    } catch (err) {
      console.warn("Session restoration failed:", err);
    }
  }
}
```

#### **6. On User Login (Both Web & PWA)**
```javascript
// After successful password verification
const fingerprint = getFingerprint();

// Store session in Supabase
await supabase.from("verp_sessions").upsert({
  user_id: user.id,
  device_fingerprint: fingerprint,
  updated_at: new Date().toISOString(),
});

// Store auth in localStorage
localStorage.setItem("userEmail", user.email);
localStorage.setItem("userId", user.id);
localStorage.setItem("deviceFingerprint", fingerprint);

// PWA-specific setup
if (isPWAMode()) {
  localStorage.setItem("vrp_is_pwa", "1");
  localStorage.setItem("vrp_session_type", "pwa");
  localStorage.setItem("vrp_last_seen", Date.now().toString());
}
```

### Storage Keys Reference

```javascript
// Auth data (always localStorage)
localStorage.getItem("userEmail")          // User's email
localStorage.getItem("userId")             // User's Supabase ID
localStorage.getItem("userName")           // User's full name
localStorage.getItem("deviceFingerprint")  // Device security hash

// PWA-specific (localStorage only)
localStorage.getItem("vrp_is_pwa")         // "1" = PWA mode flag
localStorage.getItem("vrp_session_type")   // "pwa" = PWA session
localStorage.getItem("vrp_last_seen")      // Timestamp of last activity

// Web-specific (sessionStorage only)
sessionStorage.getItem("vrp_alive")        // "1" = tab is active
sessionStorage.getItem("staffRole")        // "admin" or "assistant"
localStorage.getItem("staffRole")          // Same for cross-tab
```

### Grace Period Configuration

To change the 7-day PWA session timeout:

**In `sessionManager.js`:**
```javascript
export const isPWASessionExpired = () => {
  const lastSeen = localStorage.getItem("vrp_last_seen");
  if (!lastSeen) return false;
  
  // Change this value (milliseconds)
  const gracePeriod = 7 * 24 * 60 * 60 * 1000; // ← 7 days
  // Examples:
  // 1 day:   1 * 24 * 60 * 60 * 1000
  // 3 days:  3 * 24 * 60 * 60 * 1000
  // 14 days: 14 * 24 * 60 * 60 * 1000
  // 30 days: 30 * 24 * 60 * 60 * 1000
  
  const timeSinceLastSeen = Date.now() - parseInt(lastSeen, 10);
  return timeSinceLastSeen > gracePeriod;
};
```

### Debugging

```javascript
// Check PWA status
console.log("Is PWA mode?", isPWAMode());
console.log("Was PWA?", wasUserInPWAMode());
console.log("Session expired?", isPWASessionExpired());

// Check storage
console.log("Last seen:", localStorage.getItem("vrp_last_seen"));
console.log("Days since login:", 
  (Date.now() - parseInt(localStorage.getItem("vrp_last_seen"))) 
  / (24 * 60 * 60 * 1000)
);

// Check logout condition
console.log("Should logout?", shouldLogoutUser());

// Manual session clear (for testing)
clearAuthData();
console.log("All auth data cleared");
```

### Common Issues

**Q: PWA user stays logged out**
```javascript
// Ensure vrp_last_seen is being updated
console.log("Last seen:", localStorage.getItem("vrp_last_seen"));
// If old or empty, update it manually:
localStorage.setItem("vrp_last_seen", Date.now().toString());
```

**Q: Web user doesn't logout on tab close**
```javascript
// Verify pagehide listener exists
window.addEventListener("pagehide", (e) => {
  console.log("Pagehide fired, persisted:", e.persisted);
  // Should fire with persisted: false on tab close
});
```

**Q: Session won't restore**
```javascript
// Check Supabase has the session
const { data: sessions } = await supabase
  .from("verp_sessions")
  .select("*");
console.log("Sessions in DB:", sessions);

// Check user exists
const { data: users } = await supabase
  .from("verp_users")
  .select("*")
  .eq("email", userEmail);
console.log("User in DB:", users);
```

**Q: localStorage keeps getting cleared**
```javascript
// Check if clearAuthData() is being called unexpectedly
// Add logging:
const originalClear = localStorage.clear;
localStorage.clear = function() {
  console.trace("localStorage.clear() called from:");
  originalClear.call(this);
};
```

### Performance Optimization

**Reduce vrp_last_seen writes:**
```javascript
// Only update if > 5 minutes has passed since last update
export const updatePWALastSeen = () => {
  if (!wasUserInPWAMode()) return;
  
  const lastUpdate = localStorage.getItem("vrp_last_seen");
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (!lastUpdate || (now - parseInt(lastUpdate)) > fiveMinutes) {
    localStorage.setItem("vrp_last_seen", now.toString());
  }
};
```

**Debounce interaction updates:**
```javascript
let updateTimeout;
const debouncedUpdate = () => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    updatePWALastSeen();
  }, 1000); // Wait 1 second after last activity
};

document.addEventListener("click", debouncedUpdate);
```

### Testing Checklist

```javascript
// Test 1: Web user logout on new tab
localStorage.removeItem("userEmail");
sessionStorage.removeItem("vrp_alive");
console.assert(shouldLogoutUser() === true, "Web user should logout");

// Test 2: Web user login persistence
sessionStorage.setItem("vrp_alive", "1");
localStorage.setItem("userEmail", "test@gmail.com");
console.assert(shouldLogoutUser() === false, "Should not logout");

// Test 3: PWA user within grace period
localStorage.setItem("vrp_is_pwa", "1");
localStorage.setItem("vrp_last_seen", Date.now().toString());
console.assert(shouldLogoutUser() === false, "PWA within grace should not logout");

// Test 4: PWA user grace expired
localStorage.setItem("vrp_last_seen", 
  (Date.now() - 8 * 24 * 60 * 60 * 1000).toString()
);
console.assert(shouldLogoutUser() === true, "PWA expired should logout");
```
