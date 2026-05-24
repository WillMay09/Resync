# Resync — Sprint 0 Progress

## Status: Sprint 0 Complete

Sprint 0 goal: runnable skeleton with auth, Firestore data model, flame score engine, and design system. No UI polish — just wiring.

---

## What Was Built

### Design System (`constants/`)

| File | Purpose |
|------|---------|
| `constants/theme.ts` | Color token system. Two palettes: amber (`#D4823A`) for deep work identity, cool blue (`#9ec4f0`) for shallow work identity. Dark background `#0e0e10`. All components import from here — no hardcoded colors anywhere. |
| `constants/flame.ts` | EMA formula constants: `DECAY = 0.97`, `GAIN = 1.0`. Stage thresholds: spark → small_flame → flame → fire → inferno. |

### TypeScript Types (`types/index.ts`)

Full schema in TypeScript for the three Firestore document types:

- **`UserDocument`** — all user fields including consistency score, flame stage, session anchor time, morning check-in time, subscription status, preferences
- **`GoalDocument`** — long-term missions (e.g. "Finish the novel"). Has `isPrimary`, `totalSessions`, `active` flags
- **`SessionDocument`** — each completed work session, with optional `goalId` linking back to a goal

### Firebase Layer (`firebase/`)

| File | Purpose |
|------|---------|
| `firebase/config.ts` | Initializes Firebase JS SDK once. `getApps()` guard prevents duplicate init on Expo fast-refresh. Exports `db` and `auth`. |
| `firebase/auth.ts` | `signInWithGoogle()`, `signInWithApple()`, `signOut()`. No email/password — Google + Apple one-tap only. |
| `firebase/firestore.ts` | All Firestore CRUD: `createUserDocument` (idempotent — safe to call on every sign-in), `getUserDocument`, `updateUserDocument`, `getActiveGoals`, `addGoal`, `setPrimaryGoal`, `writeSession`. |

### React Hooks (`hooks/`)

| File | Purpose |
|------|---------|
| `hooks/useAuth.ts` | Wraps Firebase `onAuthStateChanged`. Returns `{ user, loading }`. Loading state prevents auth flicker on cold start. |
| `hooks/useFlameScore.ts` | Subscribes to `users/{uid}` via Firestore `onSnapshot`. On every update, applies **lazy decay** client-side: `score × 0.97^elapsed_days`. Returns `{ score, stage }`. Real-time — updates across tabs/devices instantly. |

### Client State (`store/sessionStore.ts`)

Zustand store holding in-progress session state: `goalText`, `goalId?`, `sessionType`, `plannedDurationMinutes`, `startedAt`. Never writes to Firestore mid-session — only on completion. This means a crash during a session loses the session but never corrupts Firestore data.

### UI Components (`components/ui/`)

| File | Purpose |
|------|---------|
| `Screen.tsx` | `SafeAreaView` wrapper with `colors.bg` background. Every screen uses this as its root. |
| `PrimaryBtn.tsx` | Amber `Pressable` with `Haptics.impactAsync` on press. The main CTA button. |
| `GhostBtn.tsx` | Border-only `Pressable` for secondary actions. |
| `FlameIcon.tsx` | SVG flame rendered via `react-native-svg`. Static visual used on all screens except the active session screen (which will use the Rive animation in Sprint 2). Includes outer flame, inner highlight, and base ellipse with radial gradients. |

### Auth Flow (`app/(auth)/`)

`sign-in.tsx` handles:
1. Google sign-in via `expo-auth-session` + `promptAsync()` → browser OAuth flow
2. Apple sign-in via `expo-apple-authentication` (iOS only — platform-guarded)
3. On success: calls `createUserDocument` (idempotent), then routes to `/(app)`

### Root Auth Gate (`app/_layout.tsx`)

Watches `useAuth()` + `useSegments()`. Rules:
- Not authenticated + not in `(auth)` group → redirect to `/(auth)/sign-in`
- Authenticated + in `(auth)` group → redirect to `/(app)`

This means the router always enforces auth state without any screen needing to check it.

### Cloud Functions (`functions/src/`)

| File | Purpose |
|------|---------|
| `functions/src/ema.ts` | `computeNewScore()`, `getFlameStage()`, `daysBetween()`, `todayString()`. Pure functions — no Firebase imports. Testable in isolation. |
| `functions/src/types.ts` | Admin-side types mirroring the client types. |
| `functions/src/index.ts` | Two Cloud Functions: `onSessionComplete` (Firestore trigger on session creation — updates flame score + increments goal.totalSessions if goalId present, wrapped in transaction) and `nightlyDecay` (scheduled, disabled for MVP). |

### Sprint 0 Placeholder Screen (`app/(app)/index.tsx`)

Shows: FlameIcon + flame stage label + score + user email. Confirms the full data pipeline works end-to-end. Will be replaced in Sprint 1.

---

## Running the Project

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
- Google Cloud OAuth credentials (for Google sign-in)

### 1. Firebase Setup

In the Firebase Console:
1. Create a new project
2. Enable **Authentication** → Sign-in methods → Google, Apple
3. Enable **Firestore Database** → Start in test mode (lock down rules before launch)
4. Go to **Project Settings → Your apps** → Add a Web app → copy the config values

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in `.env` with your Firebase values and Google OAuth client IDs:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...

EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
```

For Google client IDs: Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client IDs (one per platform: Android, iOS, Web).

### 3. Install Dependencies

```bash
cd /home/wmayhood/repos/resync
npm install --legacy-peer-deps
```

### 4. Run the App

```bash
# Expo Go (no build needed — fastest for development)
npm start

# Android simulator
npm run android

# iOS simulator (Mac only)
npm run ios

# Web browser
npm run web
```

Scan the QR code with Expo Go on your phone, or press `a` for Android / `i` for iOS / `w` for web.

### 5. Deploy Cloud Functions (optional for local dev)

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

> For local dev, you can skip Cloud Functions. The client-side lazy decay in `useFlameScore.ts` handles flame calculation on open. Cloud Functions only add score on session completion — which isn't wired to a real session flow yet.

---

## Firestore Security Rules (before launch)

The current setup uses test mode (open read/write). Before any real users:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

## What Comes Next

| Sprint | Focus |
|--------|-------|
| **Sprint 1** | Onboarding flow (work type, session anchor time, morning check-in time), home screen (time until session, mode indicator, goals list), morning check-in screen |
| **Sprint 2** | Resync Button ritual (haptic pulse → neuroscience fact → goal confirmation → session starts), active session screen with Rive flame animation |
| **Sprint 3** | Post-session screen, AI coaching (Claude Haiku pre/post session), session history |
| **Sprint 4** | RevenueCat billing, subscription gate, settings screen |
