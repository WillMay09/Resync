# Resync — Progress

## Current Status: Sprint 1 Complete

---

## Sprint 0 — Foundation

**Goal:** Runnable skeleton with auth, Firestore data model, flame score engine, and design system.

### What Was Built

**Design System (`constants/`)**

| File | Purpose |
|------|---------|
| `constants/theme.ts` | Color token system. Two palettes: amber (`#D4823A`) for deep work identity, cool blue (`#9ec4f0`) for shallow work identity. Dark background `#0e0e10`. All components import from here — no hardcoded colors anywhere. |
| `constants/flame.ts` | EMA formula constants: `DECAY = 0.97`, `GAIN = 1.0`. Stage thresholds: spark → small_flame → flame → fire → inferno. |

**TypeScript Types (`types/index.ts`)**

Full schema in TypeScript for the three Firestore document types:

- **`UserDocument`** — all user fields including consistency score, flame stage, session anchor time, morning check-in time, subscription status, preferences
- **`GoalDocument`** — long-term missions (e.g. "Finish the novel"). Has `isPrimary`, `totalSessions`, `active` flags
- **`SessionDocument`** — each completed work session, with optional `goalId` linking back to a goal

**Firebase Layer (`firebase/`)**

| File | Purpose |
|------|---------|
| `firebase/config.ts` | Initializes Firebase JS SDK once. `getApps()` guard prevents duplicate init on Expo fast-refresh. Exports `db` and `auth`. |
| `firebase/auth.ts` | `signInWithGoogle()`, `signInWithApple()`, `signOut()`. No email/password — Google + Apple one-tap only. |
| `firebase/firestore.ts` | All Firestore CRUD: `createUserDocument` (idempotent — safe to call on every sign-in), `getUserDocument`, `updateUserDocument`, `getActiveGoals`, `addGoal`, `setPrimaryGoal`, `writeSession`. |

**React Hooks (`hooks/`)**

| File | Purpose |
|------|---------|
| `hooks/useAuth.ts` | Wraps Firebase `onAuthStateChanged`. Returns `{ user, loading }`. Loading state prevents auth flicker on cold start. |
| `hooks/useFlameScore.ts` | Subscribes to `users/{uid}` via Firestore `onSnapshot`. On every update, applies **lazy decay** client-side: `score × 0.97^elapsed_days`. Returns `{ score, stage }`. Real-time — updates across tabs/devices instantly. |

**Client State (`store/sessionStore.ts`)**

Zustand store holding in-progress session state: `goalText`, `goalId?`, `sessionType`, `plannedDurationMinutes`, `startedAt`. Never writes to Firestore mid-session — only on completion.

**UI Components (`components/ui/`)**

| File | Purpose |
|------|---------|
| `Screen.tsx` | `SafeAreaView` wrapper with `colors.bg` background. Every screen uses this as its root. |
| `PrimaryBtn.tsx` | Amber `Pressable` with `Haptics.impactAsync` on press. The main CTA button. |
| `GhostBtn.tsx` | Border-only `Pressable` for secondary actions. |
| `FlameIcon.tsx` | SVG flame rendered via `react-native-svg`. Static visual used on all screens except the active session screen (which will use the Rive animation in Sprint 2). |

**Auth Flow (`app/(auth)/sign-in.tsx`)**

Google sign-in via `expo-auth-session`, Apple sign-in via `expo-apple-authentication` (iOS only). On success: `createUserDocument` (idempotent) → route to `/(app)`.

**Root Auth Gate (`app/_layout.tsx`)**

Watches `useAuth()` + `useSegments()`. Redirects unauthenticated users to sign-in, authenticated users away from auth screens.

**Cloud Functions (`functions/src/`)**

| File | Purpose |
|------|---------|
| `functions/src/ema.ts` | `computeNewScore()`, `getFlameStage()`, `daysBetween()`. Pure functions — testable in isolation. |
| `functions/src/types.ts` | Admin-side types mirroring the client types. |
| `functions/src/index.ts` | `onSessionComplete` (Firestore trigger on session creation — updates flame score, wrapped in transaction) and `nightlyDecay` (scheduled, disabled for MVP). |

---

## Sprint 1 — Full Session Loop

**Goal:** Complete pre-session → active session → post-session loop end-to-end. No Rive animation, no AI coaching, no paywall. Functional, not polished.

### What Was Modified

| File | Change |
|------|--------|
| `types/index.ts` | Added `onboardingComplete: boolean` to `UserDocument` |
| `constants/theme.ts` | Added `bgCardHov: 'rgba(255,255,255,0.07)'` color token |
| `firebase/firestore.ts` | Added `onboardingComplete: false` to `createUserDocument()` defaults. Added `getGoal()`, `updateGoal()`, `archiveGoal()` for goals CRUD. Rewrote `setPrimaryGoal()` to use Firestore `runTransaction` — queries for all `isPrimary: true` goals and clears them in the same atomic transaction that sets the new primary, preventing the race condition where concurrent clients could leave multiple goals marked primary. |
| `store/sessionStore.ts` | Expanded `ActiveSession` with `distractionRating`, `completedAt`, `durationMinutes`. Added `setDistractionRating()` and `completeSession()` actions. Session data now accumulates through the flow and is only written to Firestore on "Done". |
| `app/(app)/_layout.tsx` | Rewritten: now watches `useUserDoc()` for `onboardingComplete` and redirects to onboarding or tabs accordingly |
| `app/(app)/index.tsx` | Rewritten: redirect-only component that routes to `(tabs)` or `onboarding/intro` based on `onboardingComplete` |
| `app/(app)/(tabs)/index.tsx` | Goal cards are now tappable (navigates to goal editor) and long-pressable (sets as primary). "+ Add a mission" card navigates to goal editor in create mode. Goals list refreshes on screen focus via `useFocusEffect`. |

### What Was Created

**Constants (1 file)**

| File | Purpose |
|------|---------|
| `constants/facts.ts` | 32 neuroscience facts about attention, focus, and habit formation. Exports `FACTS` array and `getRandomFact()` helper. Used by the Resync button decompression sequence. |

**Hooks (3 files)**

| File | Purpose |
|------|---------|
| `hooks/useUserDoc.ts` | Real-time `onSnapshot` subscription on `users/{uid}`. Returns `{ userDoc, loading }`. Same pattern as `useFlameScore`. Used by onboarding gate, home screen, session flow. |
| `hooks/useCountdown.ts` | Given `"HH:MM"` target time, returns `{ hours, minutes, isPast }`. 1-second `setInterval`. Used by home screen countdown card. |
| `hooks/useMode.ts` | Given `sessionAnchorTime`, derives current mode (`'deep'` or `'shallow'`). Returns `{ mode, label }`. Deep mode activates from 30 min before anchor until 2 hours after. 60-second re-evaluation interval. |

**UI Components (2 files)**

| File | Purpose |
|------|---------|
| `components/ui/SelectionCard.tsx` | Tappable card for onboarding choices. Props: `label`, `sublabel?`, `selected`, `onPress`. Amber border + dim background when selected. `Haptics.selectionAsync()` on tap. |
| `components/ui/SegmentedPicker.tsx` | Horizontal row of options. Props: `options[]`, `selected`, `onSelect`. Used for duration (45/60/90 min) and planning preference (Morning/Evening). `Haptics.selectionAsync()` on selection. |

**Tab Navigation (5 files)**

| File | Purpose |
|------|---------|
| `app/(app)/(tabs)/_layout.tsx` | Bottom tab navigator with 4 tabs: Home, Calendar, Plan, Profile. Dark background, amber active tint. |
| `app/(app)/(tabs)/index.tsx` | **Home screen — daily hub.** Header (date + greeting), mode pill (deep=amber, shallow=blue), countdown card (hours:minutes until session), goals list (glyph + label + "Today" badge on primary), dashed "Add a mission" card, flame score row, "Start session" button at bottom. Uses `useAuth`, `useUserDoc`, `useFlameScore`, `useCountdown`, `useMode`, `getActiveGoals`. |
| `app/(app)/(tabs)/calendar.tsx` | Stub — "Coming soon" centered text. |
| `app/(app)/(tabs)/plan.tsx` | Stub — "Coming soon" centered text. |
| `app/(app)/(tabs)/profile.tsx` | Sign-out `GhostBtn`. |

**Onboarding Flow (7 files)**

| File | Purpose |
|------|---------|
| `app/(app)/onboarding/_layout.tsx` | Stack navigator with `headerShown: false`, `slide_from_right` animation. |
| `app/(app)/onboarding/intro.tsx` | 3-slide `FlatList` carousel with dot indicators. Slides: "The hardest part", "Less is more", "Protection, not productivity". Next/Skip buttons. |
| `app/(app)/onboarding/customize.tsx` | Preferences screen. 4 `SelectionCard`s for preferred session time (Morning/Midday/Evening/Varies), 5 for work type (Writing/Coding/Strategy/Learning/Other), `SegmentedPicker` for planning preference (Morning/Evening). Writes to Firestore on "Continue". |
| `app/(app)/onboarding/schedule.tsx` | Anchor time + duration picker. Preset time buttons based on `preferredSessionTime` (no external picker — Expo Go compatible). `SegmentedPicker` for duration (45/60/90 min). Preview card with `FlameIcon` showing selection summary. Writes to Firestore on "Set this time". |
| `app/(app)/onboarding/week-view.tsx` | Read-only 7-day visualization. Shows amber session blocks positioned at anchor time across Mon–Sun columns. Block height proportional to duration. |
| `app/(app)/onboarding/first-goal.tsx` | `TextInput` for goal label + optional subtitle. Row of 8 unicode glyph options (✦ ◆ ▲ ● ★ ♦ ⬡ ◉). Writes goal to Firestore `goals` subcollection with `isPrimary: true`. |
| `app/(app)/onboarding/resync-demo.tsx` | Large circular Resync button with Reanimated pulse glow (`withRepeat`). Long-press (1.5s) triggers decompression: haptic → random neuroscience fact (3s display) → "You're ready" confirmation. "Begin your journey" sets `onboardingComplete: true` and redirects to tabs. |

**Goals CRUD (1 file)**

| File | Purpose |
|------|---------|
| `app/(app)/goal-editor.tsx` | Full-screen goal editor. Route param `goalId` switches between create and edit mode. Create mode adds a new goal and sets it as primary. Edit mode updates label, subtitle, glyph. Archive button (edit mode only) soft-deletes by setting `active: false`. Back navigation returns to home screen, which refetches goals on focus. |

**Session Flow (5 files)**

| File | Purpose |
|------|---------|
| `app/(app)/session/_layout.tsx` | Stack navigator with `headerShown: false`, `fade` animation. |
| `app/(app)/session/resync-button.tsx` | Real decompression ritual. Same pulsing Resync button UI. Long-press → haptic → fact (4s) → goal confirmation (editable `TextInput` pre-filled with primary goal). "Begin session" calls `useSessionStore.startSession()` and navigates to distraction report. |
| `app/(app)/session/distraction-report.tsx` | "How scattered do you feel right now?" Three large cards: Clear (1) / A bit (2) / Very (3). On tap: `setDistractionRating(rating)` → navigate to active timer. |
| `app/(app)/session/active.tsx` | Countdown timer from `plannedDurationMinutes` to 0 (1-second interval, `MM:SS` display). `FlameIcon` at 120px (static placeholder — Rive in Sprint 2). Goal text below timer. "End early" `GhostBtn` with `Alert.alert` confirmation. On timer end or early end: `completeSession(completedAt, durationMinutes)` → navigate to post-session. No Firestore writes here. |
| `app/(app)/session/post-session.tsx` | Celebration header (`FlameIcon` + "Session complete"). Stats row (actual duration, planned duration, pre-session distraction). "Did you meet your goal?" Yes/Not quite toggle. Break ritual cards (Walk outside, Stretch, Make a drink, Close your eyes — tappable placeholders). "Done" button writes session to Firestore via `writeSession()` (triggers `onSessionComplete` Cloud Function), clears Zustand store, and navigates back to home. |

### End-to-End Flow

```
Sign in
  → Onboarding (new users)
    → intro (3-slide carousel)
    → customize (session time, work type, planning pref)
    → schedule (anchor time, duration)
    → week-view (visualization)
    → first-goal (label, subtitle, glyph)
    → resync-demo (long-press practice)
  → Home screen (returning users)
    → Mode pill (deep/shallow)
    → Countdown to session
    → Goals list
      → Tap goal → Goal editor (edit mode)
      → Long-press goal → Set as primary ("Today")
      → "+ Add a mission" → Goal editor (create mode)
    → "Start session" button
      → Resync button (decompression)
      → Distraction report (1/2/3)
      → Active timer (MM:SS countdown)
      → Post-session (stats, goal met, break)
        → Firestore write → Cloud Function fires
        → Back to Home (flame score updates in real time)
```

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

### 3. Install & Run

```bash
cd /home/wmayhood/repos/resync
npm install --legacy-peer-deps
npm start
```

### 4. Deploy Cloud Functions (required for flame score updates after sessions)

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## What Comes Next

| Sprint | Focus | Status |
|--------|-------|--------|
| **Sprint 0** | Auth, schema, Cloud Functions, hooks, UI primitives | Complete |
| **Sprint 1** | Onboarding, home screen, session flow (pre → active → post), tab nav, goals CRUD | Complete |
| **Sprint 2** | Rive flame animation, RevenueCat paywall, push notifications | Next |
| **Sprint 3** | AI coaching (Claude API), analytics (PostHog) | |
| **Sprint 4** | App blocking, settings screen, offline session queue (`expo-sqlite`) | |
| **Sprint 5** | Launch prep (TestFlight, Play Console, App Store assets) | |
