## PWA Session Persistence - Implementation Guide

### Overview
This document explains the PWA session persistence fix that enables PWA users to stay logged in for 7 days, while web users are logged out when closing their tab.

### Problem Solved
Previously, the app treated PWA closing exactly like closing a browser tab, which caused:
1. **Session self-destruction**: `pagehide` event deleted active sessions from Supabase
2. **Wrong storage**: Used `sessionStorage` which gets wiped when PWA is closed
3. **Unified logout logic**: Same "clear all data" logic for both web and PWA users

### Solution Architecture

#### 1. Session Manager Utility (`src/utils/sessionManager.js`)
Central utility for all environment-aware session logic:

- **`isPWAMode()`**: Detects current standalone/PWA mode
- **`wasUserInPWAMode()`**: Checks persistent flag to know if user was in PWA
- **`isPWASessionExpired()`**: Checks if 7-day grace period exceeded
- **`shouldLogoutUser()`**: Smart logout check:
  - **PWA**: Logout only if 7 days passed
  - **Web**: Logout if no `sessionStorage.vrp_alive`
- **`updatePWALastSeen()`**: Updates timestamp for PWA users
- **`markWebSessionAlive()`**: Sets `sessionStorage` flag for web users
- **`getSupabaseStorage()`**: Returns appropriate storage based on environment

#### 2. Session Flow

##### **PWA User - First Install**
```
User installs app → Paths.jsx runs → Detects standalone mode
→ Sets vrp_is_pwa = "1" flag → Supabase uses localStorage
```

##### **PWA User - Login**
```
User logs in → AuthPage detects PWA → Sets:
  - vrp_is_pwa = "1" (persistent marker)
  - vrp_session_type = "pwa"
  - vrp_last_seen = Date.now()
  - userEmail, userId, userName
```

##### **PWA User - Reopens App After 1 Day**
```
Paths.jsx initializes → Checks vrp_last_seen
→ Not expired (< 7 days) → Updates vrp_last_seen
→ User stays logged in
```

##### **PWA User - Reopens App After 8 Days**
```
Paths.jsx initializes → Checks vrp_last_seen
→ Expired (> 7 days) → Clears all auth data
→ User must login again
```

##### **PWA User - Active Session**
```
User interacts with navbar → Listeners update vrp_last_seen
→ Session timer resets → User stays logged in
```

##### **Web User - New Tab**
```
User opens new tab → Paths.jsx checks sessionStorage.vrp_alive
→ Not found → User logged out
```

##### **Web User - Same Tab**
```
User refreshes page → sessionStorage sets vrp_alive = "1"
→ Session persists within tab
```

##### **Web User - Closes Tab**
```
Tab closes → pagehide fires → Web-only deletion:
  → Deletes session from Supabase (prevents resume in PWA)
→ sessionStorage cleared automatically by browser
```

### Key Changes

#### 1. Navbar.jsx
- **Removed**: Destructive `pagehide` listener that deleted all sessions
- **Added**: Smart session check using `shouldLogoutUser()`
- **Added**: PWA-only `updatePWALastSeen()` on user interaction
- **Added**: Web-only delete on `pagehide`

#### 2. Paths.jsx
- **Fixed**: Session initialization to properly detect PWA
- **Fixed**: `pagehide` deletion limited to web-only users
- **Enhanced**: Session restoration for PWA users with 7-day grace

#### 3. AuthPage.jsx
- **Added**: `vrp_is_pwa` flag on login/signup for PWA users
- **Unchanged**: Existing session creation logic

#### 4. supabaseClient.js
- **Updated**: Storage now calls `getSupabaseStorage()` instead of hardcoding `sessionStorage`
- **Benefit**: Supabase uses localStorage for PWA, sessionStorage for web

### Storage Strategy

| Environment | Storage | Persistence | Cleared When |
|-------------|---------|-------------|--------------|
| **Web User** | `sessionStorage` | Same tab only | Tab closes |
| **PWA User** | `localStorage` | Across app closes | 7 days pass |

### LocalStorage Keys Used

| Key | Type | Duration | Used By |
|-----|------|----------|---------|
| `vrp_is_pwa` | Flag | Persistent | Marks previous PWA install |
| `vrp_session_type` | Value | Session | "pwa" or undefined |
| `vrp_last_seen` | Timestamp | Session | PWA 7-day timer |
| `userEmail` | Value | Session | Auth state |
| `userId` | Value | Session | Auth state |
| `userName` | Value | Session | Auth state |
| `deviceFingerprint` | Value | Session | Security |

### Testing Checklist

- [ ] **Web User - Tab Close**: User logged out on tab close
- [ ] **Web User - Refresh**: User stays logged in on refresh (same tab)
- [ ] **PWA User - Install**: App detects standalone → sets vrp_is_pwa
- [ ] **PWA User - Login**: All flags set correctly
- [ ] **PWA User - Interaction**: vrp_last_seen updates on clicks
- [ ] **PWA User - 1 Day Later**: Opens app → still logged in
- [ ] **PWA User - 8 Days Later**: Opens app → forced logout
- [ ] **PWA User - Resume After 5 Days**: vrp_last_seen resets on interaction
- [ ] **Session Restoration**: If localStorage cleared but session active, restore from DB
- [ ] **Staff Sessions**: Never auto-logout regardless of environment

### Common Issues & Solutions

#### Issue: PWA User Logged Out Too Early
**Check**: 
- vrp_last_seen timestamp being updated
- updatePWALastSeen() called on interaction
- Grace period calculation (7 days = 7*24*60*60*1000 ms)

#### Issue: Web User Stays Logged In After Tab Close
**Check**: 
- pagehide listener is web-only (checks `wasUserInPWAMode()`)
- sessionStorage is being used
- Browser isn't restoring session

#### Issue: Session Restoration Not Working
**Check**:
- Supabase has active session row
- User data exists in verp_users table
- localStorage is being cleared (testing scenario)
- Try catch block logs errors

### Performance Notes

- **no db hits** on page load for session check (uses localStorage)
- **1 db call** only if PWA user's localStorage is empty (session restore)
- **1 db delete** only when web user closes tab
- **Supabase session check** runs every 30 seconds (unchanged)

### Security Considerations

1. **Device Fingerprint**: Unchanged - still verified to prevent session hijacking
2. **Pagehide Deletion**: Only for web to prevent PWA->Web account takeover
3. **7-day Limit**: Ensures PWA sessions don't persist indefinitely
4. **Staff Sessions**: Bypasses all timeouts - uses staffRole flag

### Future Improvements

- [ ] Add manual session expiry button for PWA users
- [ ] Display session countdown for PWA (days remaining)
- [ ] Cache last_seen update to reduce frequent writes
- [ ] Add PWA notification before automatic logout
- [ ] Sync last_seen to Supabase for cross-device tracking
