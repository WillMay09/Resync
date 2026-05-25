# Resync — Architecture Reference (Sprint 0 + Sprint 1)

---

## Project Overview

Resync is a React Native + Expo mobile app that helps knowledge workers transition into deep work sessions. The product is built around a three-phase loop — **PRE-SESSION → ACTIVE SESSION → POST-SESSION** — centered on a ritual "Resync" button and a flame metaphor that visually tracks consistency using an Exponential Moving Average (EMA) scoring system.

**Stack:** Expo SDK 56, React 19, React Native 0.85, TypeScript 6, Firebase Auth + Firestore + Cloud Functions v2, Zustand 5, React Native Reanimated 4, React Native SVG.

---

## Directory Structure

```
resync/
├── app/                            # Expo Router — file-based routing
│   ├── _layout.tsx                 # Root layout + auth gate
│   ├── (auth)/
│   │   ├── _layout.tsx             # Auth group stack
│   │   └── sign-in.tsx             # Google + Apple sign-in
│   └── (app)/
│       ├── _layout.tsx             # Authenticated group stack + onboarding gate
│       ├── index.tsx               # Redirect: routes to (tabs) or onboarding
│       ├── (tabs)/                 # Bottom tab navigator (Sprint 1)
│       │   ├── _layout.tsx         # Tab layout: Home, Calendar, Plan, Profile
│       │   ├── index.tsx           # Home screen — daily hub
│       │   ├── calendar.tsx        # Stub — "Coming soon"
│       │   ├── plan.tsx            # Stub — "Coming soon"
│       │   └── profile.tsx         # Sign-out button
│       ├── onboarding/             # First-run onboarding flow (Sprint 1)
│       │   ├── _layout.tsx         # Stack with slide_from_right animation
│       │   ├── intro.tsx           # 3-slide carousel
│       │   ├── customize.tsx       # Session time, work type, planning preference
│       │   ├── schedule.tsx        # Anchor time + duration picker
│       │   ├── week-view.tsx       # 7-day schedule visualization
│       │   ├── first-goal.tsx      # Goal label, subtitle, glyph picker
│       │   └── resync-demo.tsx     # Long-press Resync button demo
│       └── session/                # Active session flow (Sprint 1)
│           ├── _layout.tsx         # Stack with fade animation
│           ├── resync-button.tsx   # Decompression ritual → starts session
│           ├── distraction-report.tsx # Pre-session: "How scattered?" (1/2/3)
│           ├── active.tsx          # Countdown timer with FlameIcon
│           └── post-session.tsx    # Stats, goal met, break ritual, Firestore write
│
├── components/ui/                  # Shared UI primitives
│   ├── Screen.tsx                  # SafeAreaView wrapper
│   ├── PrimaryBtn.tsx              # Amber CTA with haptics
│   ├── GhostBtn.tsx                # Border-only secondary button
│   ├── FlameIcon.tsx               # Static SVG flame
│   ├── SelectionCard.tsx           # Tappable card for onboarding choices (Sprint 1)
│   └── SegmentedPicker.tsx         # Horizontal option row (Sprint 1)
│
├── constants/
│   ├── theme.ts                    # Color token system
│   ├── flame.ts                    # EMA constants + stage thresholds
│   └── facts.ts                    # 32 neuroscience facts + getRandomFact() (Sprint 1)
│
├── firebase/
│   ├── config.ts                   # Firebase app init
│   ├── auth.ts                     # signInWithGoogle, signInWithApple, signOut
│   └── firestore.ts                # All Firestore CRUD (users, goals, sessions)
│
├── hooks/
│   ├── useAuth.ts                  # Firebase auth state subscription
│   ├── useFlameScore.ts            # Real-time flame score with lazy decay
│   ├── useUserDoc.ts               # Real-time user document subscription (Sprint 1)
│   ├── useCountdown.ts             # Countdown to HH:MM target time (Sprint 1)
│   └── useMode.ts                  # Derives deep/shallow mode from anchor time (Sprint 1)
│
├── store/
│   └── sessionStore.ts             # Zustand — in-progress session state
│
├── types/
│   └── index.ts                    # Client-side TypeScript types
│
├── functions/                      # Firebase Cloud Functions (separate Node project)
│   ├── src/
│   │   ├── index.ts                # onSessionComplete + nightlyDecay
│   │   ├── ema.ts                  # EMA formula (pure functions)
│   │   └── types.ts                # Admin-side types (Timestamp)
│   ├── package.json
│   └── tsconfig.json
│
├── assets/                         # App icons, splash screen
├── app.json                        # Expo config
├── package.json
├── tsconfig.json                   # Extends expo/tsconfig.base, strict mode
├── .env.example                    # Environment variable template
└── .gitignore
```

---

## Design System

### Color Tokens — `constants/theme.ts`

All colors are imported from a single `colors` object. No hardcoded colors anywhere in the codebase.

| Token | Value | Usage |
|---|---|---|
| `bg` | `#0e0e10` | App background (near-black) |
| `bgCard` | `rgba(255,255,255,0.04)` | Card backgrounds |
| `bgCardHov` | `rgba(255,255,255,0.07)` | Card hover/pressed backgrounds |
| `border` | `rgba(255,255,255,0.08)` | Default borders |
| `borderHov` | `rgba(255,255,255,0.14)` | Hover/pressed borders |
| `text` | `#f0ece4` | Primary text (warm white) |
| `textMuted` | `rgba(240,236,228,0.38)` | Tertiary text, hints |
| `textSub` | `rgba(240,236,228,0.6)` | Secondary text |
| `accent` | `#D4823A` | Deep work identity (amber) |
| `accentDim` | `rgba(212,130,58,0.18)` | Amber backgrounds |
| `accentMid` | `rgba(212,130,58,0.45)` | Amber borders, mid-intensity |
| `shallow` | `#9ec4f0` | Shallow work identity (cool blue) |
| `shallowDim` | `rgba(160,200,240,0.08)` | Shallow mode backgrounds |
| `shallowBorder` | `rgba(160,200,240,0.18)` | Shallow mode borders |

Two distinct palettes: **amber** for deep work, **cool blue** for shallow work mode. The separation is intentional — the user should feel a different visual identity depending on which mode they're in.

### Typography

- **DM Sans** (weights 300, 400, 500, 600) — body and headings
- **DM Mono** (weights 300, 400) — scores, times, numeric values

Loaded via `@expo-google-fonts/dm-sans` and `@expo-google-fonts/dm-mono`.

### UI Components

| Component | File | Description |
|---|---|---|
| `Screen` | `components/ui/Screen.tsx` | `SafeAreaView` with `flex: 1` and `colors.bg` background. Every screen's root container. Accepts optional `style` override. |
| `PrimaryBtn` | `components/ui/PrimaryBtn.tsx` | Full-width amber `Pressable` (border-radius 14). Fires `Haptics.impactAsync(Light)` on press. Has pressed state (opacity 0.88, translateY 1px) and disabled state (opacity 0.4). Shadow uses `colors.accent`. |
| `GhostBtn` | `components/ui/GhostBtn.tsx` | Full-width border-only `Pressable` (1px `colors.border`, border-radius 14). On press, reduces opacity and shows `colors.bgCard` background. |
| `FlameIcon` | `components/ui/FlameIcon.tsx` | Static SVG flame built with `react-native-svg`. Two `RadialGradient` fills (outer flame, inner highlight) plus a semi-transparent base ellipse. Props: `size` (default 48, height scales to `size * 1.2`), `opacity` (default 1). Used on all screens except the active session screen, which will use the Rive animation in Sprint 2. |
| `SelectionCard` | `components/ui/SelectionCard.tsx` | Tappable card for onboarding choices. Props: `label`, `sublabel?`, `selected`, `onPress`. Amber border + dim background when selected. Fires `Haptics.selectionAsync()` on tap. |
| `SegmentedPicker` | `components/ui/SegmentedPicker.tsx` | Horizontal row of options. Props: `options[]`, `selected`, `onSelect`. Used for duration (45/60/90 min) and planning preference (Morning/Evening). Fires `Haptics.selectionAsync()` on selection. |

---

## Architecture Patterns

### 1. Centralized Auth Gate

**File:** `app/_layout.tsx`

The root layout watches `useAuth()` and `useSegments()`. Two rules:
- Not authenticated + not in `(auth)` group → redirect to `/(auth)/sign-in`
- Authenticated + in `(auth)` group → redirect to `/(app)`

No individual screen ever checks auth. The router enforces it globally. The `loading` flag from `useAuth()` prevents redirect flicker on cold start.

### 1b. Onboarding Gate

**File:** `app/(app)/_layout.tsx`

The app layout watches `useUserDoc()` for `onboardingComplete`. Two rules:
- `onboardingComplete === false` + not in `onboarding` group → redirect to `/(app)/onboarding/intro`
- `onboardingComplete === true` + in `onboarding` group → redirect to `/(app)/(tabs)`

The `app/(app)/index.tsx` is a redirect-only component that reads `onboardingComplete` and routes to the appropriate group. This means the app has two gates: auth (root) and onboarding (app group).

### 2. Lazy Decay (No Nightly Cron Required)

The flame score decays at 3% per day (`0.97^days`), but this decay is **not applied on a schedule** for active users. Instead:

- **Client reads:** `useFlameScore` hook applies decay on every Firestore snapshot, based on elapsed days since `lastScoreDate`.
- **Server writes:** `onSessionComplete` Cloud Function applies decay for all elapsed days before adding the session gain, then writes the updated score.

This means the score is always current at the moment of read or write, without a nightly cron. The optional `nightlyDecay` function exists for analytics accuracy on churned users but is not needed for MVP.

### 3. Crash-Safe Session State

**File:** `store/sessionStore.ts`

In-progress sessions live exclusively in client memory (Zustand). Firestore is never touched until a session completes. If the app crashes mid-session, the session is lost — but Firestore data is never left in an inconsistent state. This is a deliberate tradeoff: losing a single in-progress session is acceptable; corrupting the user's score history is not.

### 4. Idempotent User Creation

**File:** `firebase/firestore.ts` → `createUserDocument()`

Called on every sign-in. Checks `snap.exists()` before writing. If the user doc already exists, returns immediately. This means the sign-in flow doesn't need to track "first sign-in vs. returning user" — the same code path handles both.

### 5. Server-Authoritative Timestamps

**File:** `firebase/firestore.ts` → `writeSession()`

`startedAt` is preserved from the client (the actual time the session began). `completedAt` is overwritten with `serverTimestamp()` to ensure server-authoritative completion time. `durationMinutes` is the definitive record of session length.

### 6. Transactional Score Updates

**File:** `functions/src/index.ts` → `onSessionComplete`

The score update is wrapped in a Firestore transaction to prevent race conditions if two sessions complete simultaneously. The transaction reads the current score, applies decay + gain, and writes back atomically.

---

## The EMA Flame System

### Formula

```
score_today = score_yesterday × 0.97^(days_elapsed) + session_completed × 1.0
```

- **DECAY = 0.97** — 3% daily decay. Score converges to ~33.3 with perfect daily sessions.
- **GAIN = 1.0** — Added once per completed deep session (shallow sessions are ignored).
- **Lazy decay** — Applied for all elapsed days in a single `Math.pow()` call, not iterated day-by-day.

### Stage Thresholds

| Stage | Score Range | Meaning |
|---|---|---|
| `spark` | 0 – 3 | First sessions, fragile |
| `small_flame` | 3 – 8 | Heat is building |
| `flame` | 8 – 16 | Real momentum |
| `fire` | 16 – 25 | Deeply grooved habit |
| `inferno` | 25+ | ~66 days consistent — habit solidified |

### Constants Location

| File | Runtime | Purpose |
|---|---|---|
| `constants/flame.ts` | Client | Imported by `useFlameScore` hook |
| `functions/src/ema.ts` | Server | Used by Cloud Functions |

These are intentionally duplicated. The server copy is authoritative; the client copy enables lazy decay on read without a network call.

### Key Design Decisions

- **Consistency over streaks.** A user who sessions 5 of 7 days weekly has a healthier flame than one who went 30 days straight and disappeared. The EMA formula naturally weights recent activity.
- **The fire never goes out.** A missed day dims the score but never zeroes it. The ember survives. This delivers the anti-guilt message without any copy needing to say it.
- **Stage transitions are never disclosed.** The user sees the visual change but never knows the exact threshold. This creates a curiosity engine (variable ratio reinforcement).
- **Only deep sessions count.** Shallow work sessions are recorded but don't affect the flame. The flame is a measure of deep work consistency.

---

## Firestore Data Model

### `users/{uid}` — UserDocument

```typescript
{
  // Identity
  email: string
  createdAt: Date

  // Flame state
  consistencyScore: number        // EMA float — source of truth
  flameStage: FlameStage          // Cached derived: "spark" | "small_flame" | "flame" | "fire" | "inferno"
  lastScoreDate: string           // "YYYY-MM-DD" — for lazy decay calculation
  totalSessions: number

  // Subscription
  trialStartedAt: Date
  subscriptionStatus: "trial" | "active" | "expired"

  // Planning
  planningPreference: "morning" | "evening"
  morningCheckInTime: string      // "HH:MM"
  sessionAnchorTime: string       // "HH:MM"
  bufferBlockStart: string        // "HH:MM"
  bufferBlockEnd: string          // "HH:MM"

  // Onboarding preferences
  preferredSessionTime: "morning" | "midday" | "evening" | "varies"
  workType: "writing" | "coding" | "strategy" | "learning" | "other"
  defaultSessionDurationMinutes: 45 | 60 | 90

  // Reward
  rewardMode: "per_session" | "end_of_day"

  // Notifications
  closingNotificationEnabled: boolean

  // Onboarding
  onboardingComplete: boolean        // false at creation, true after completing onboarding flow

  // AI (Phase 2+)
  weeklyObservation?: string

  // Calendar (Phase 2+)
  calendarConnected: boolean
  calendarProvider?: "google"
  calendarId?: string
}
```

### `users/{uid}/goals/{goalId}` — GoalDocument

```typescript
{
  label: string                   // "Finish the novel"
  sub: string                     // "Chapter 14 of 22 · Draft due in autumn"
  glyph: string                   // Single character icon e.g. "✦"
  isPrimary: boolean              // true = "Today" badge; one goal at a time
  totalSessions: number           // Incremented by Cloud Function
  active: boolean
  createdAt: Date
}
```

### `users/{uid}/sessions/{sessionId}` — SessionDocument

```typescript
{
  startedAt: Date
  completedAt: Date
  durationMinutes: number
  plannedDurationMinutes: number
  goalText: string                // Session-specific goal ("Draft chapter 14 intro")
  goalId?: string                 // Reference to goals/{goalId}
  goalMet: boolean
  distractionRating: 1 | 2 | 3   // 1=Clear, 2=A bit, 3=Very
  sessionType: "deep" | "shallow"
  date: string                    // "YYYY-MM-DD"
}
```

**Key rule:** Session documents are only written to Firestore on completion. In-progress state lives in the Zustand store only. This keeps the `onCreate` Cloud Function trigger clean — every document creation represents a finished session.

---

## Cloud Functions

### `onSessionComplete` — Firestore onCreate trigger

**Trigger:** `users/{uid}/sessions/{sessionId}` document creation

**Flow:**
1. Read the new session document.
2. If `sessionType !== 'deep'`, return (shallow sessions don't affect the flame).
3. Open a Firestore transaction.
4. Read the user's current `consistencyScore` and `lastScoreDate`.
5. Call `computeNewScore(storedScore, lastScoreDate, true)` — applies decay for all elapsed days, then adds GAIN.
6. Determine the new `flameStage` from the updated score.
7. Write `consistencyScore`, `flameStage`, `lastScoreDate`, and increment `totalSessions`.
8. If `session.goalId` exists, also increment `totalSessions` on that goal document.

### `nightlyDecay` — Scheduled function (02:00 UTC daily)

Queries users with stale `lastScoreDate` who are trial/active subscribers. Applies decay (no gain) and batch-updates. Optional for MVP — lazy evaluation handles active users. Exists for analytics accuracy on churned users.

---

## Authentication Flow

### Sign-In Methods
- **Google:** `expo-auth-session` → browser OAuth → `GoogleAuthProvider.credential` → `signInWithCredential`
- **Apple:** `expo-apple-authentication` → native Apple sign-in → `OAuthProvider('apple.com')` → `signInWithCredential`
- No email/password. No magic links. Social auth only.

### Sign-In Sequence
1. User taps "Continue with Google" or the Apple Sign In button.
2. OAuth flow completes, returns tokens.
3. Firebase credential created from tokens.
4. `signInWithCredential(auth, credential)` signs in.
5. `createUserDocument(uid, email)` runs (idempotent — safe on repeat sign-ins).
6. Router redirects to `/(app)` via the auth gate in `_layout.tsx`.

### Environment Variables

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID

EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
```

---

## State Management

### Zustand — `store/sessionStore.ts`

Holds in-progress session state only:
- `activeSession: { goalText, goalId?, sessionType, plannedDurationMinutes, startedAt, distractionRating, completedAt, durationMinutes } | null`
- `startSession(s)` — Sets the active session (distractionRating, completedAt, durationMinutes init to null)
- `setDistractionRating(rating)` — Sets the pre-session distraction rating (1/2/3)
- `completeSession(completedAt, durationMinutes)` — Marks session as complete with actual timing
- `clearSession()` — Nulls it out (called after Firestore write in post-session)

**Design principle:** No Firestore writes during a session. No persistence. Memory only. Clean crash semantics. The session data accumulates through the flow (resync → distraction report → active timer → post-session) and is only written to Firestore when the user taps "Done" on the post-session screen.

### Firebase Hooks

| Hook | File | Returns | Data Source |
|---|---|---|---|
| `useAuth` | `hooks/useAuth.ts` | `{ user, loading }` | `onAuthStateChanged` |
| `useFlameScore` | `hooks/useFlameScore.ts` | `{ score, stage }` | `onSnapshot` on `users/{uid}` + client-side lazy decay |
| `useUserDoc` | `hooks/useUserDoc.ts` | `{ userDoc, loading }` | `onSnapshot` on `users/{uid}` — full document |
| `useCountdown` | `hooks/useCountdown.ts` | `{ hours, minutes, isPast }` | 1-second `setInterval` countdown to `HH:MM` target |
| `useMode` | `hooks/useMode.ts` | `{ mode, label }` | 60-second re-evaluation — `'deep'` or `'shallow'` based on anchor time |

`useAuth` and `useFlameScore` use real-time Firestore subscriptions. `useUserDoc` also uses `onSnapshot` for real-time updates. `useCountdown` and `useMode` are pure client-side timers.

---

## Firestore Security Rules (Pre-Launch)

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

Currently in test mode (open read/write). These rules must be applied before any real users.

---

## Sprint 0 Completion Checklist

| Task | Status |
|---|---|
| Expo project init + Expo Router | Done |
| Firebase Auth (Google + Apple sign-in) | Done |
| Firestore schema (users, goals, sessions) | Done |
| Client-side types (UserDocument, GoalDocument, SessionDocument) | Done |
| Cloud Function: `onSessionComplete` with EMA logic | Done |
| Cloud Function: `nightlyDecay` (optional, disabled for MVP) | Done |
| Root auth gate (`_layout.tsx` auto-redirect) | Done |
| User document creation on first sign-in (idempotent) | Done |
| `useFlameScore` hook with lazy decay | Done |
| `useAuth` hook | Done |
| Zustand session store | Done |
| UI component library (Screen, PrimaryBtn, GhostBtn, FlameIcon) | Done |
| Color token system (`constants/theme.ts`) | Done |
| EMA constants + stage thresholds (`constants/flame.ts`) | Done |
| Firestore CRUD helpers (users, goals, sessions) | Done |
| Sprint 0 placeholder home screen (proves data pipeline) | Done |

## Sprint 1 Completion Checklist

| Task | Status |
|---|---|
| Add `onboardingComplete` to `UserDocument` type + Firestore defaults | Done |
| Add `bgCardHov` color token | Done |
| Expand Zustand session store (distractionRating, completedAt, durationMinutes) | Done |
| Neuroscience facts constant (`constants/facts.ts` — 32 facts) | Done |
| `useUserDoc` hook (real-time Firestore subscription) | Done |
| `useCountdown` hook (1-second interval countdown to HH:MM) | Done |
| `useMode` hook (deep/shallow mode from anchor time) | Done |
| `SelectionCard` UI component (onboarding choices with haptics) | Done |
| `SegmentedPicker` UI component (horizontal option row) | Done |
| Onboarding gate in `app/(app)/_layout.tsx` | Done |
| Redirect component `app/(app)/index.tsx` | Done |
| Tab navigator with 4 tabs (Home, Calendar, Plan, Profile) | Done |
| Onboarding flow — 6 screens (intro → customize → schedule → week-view → first-goal → resync-demo) | Done |
| Home screen — date, greeting, mode pill, countdown card, goals list, flame score | Done |
| Session flow — 4 screens (resync-button → distraction-report → active timer → post-session) | Done |
| Post-session Firestore write (session doc → triggers Cloud Function) | Done |
| TypeScript compiles with zero errors | Done |

---

## Known Issues & Technical Debt

### Duplicate Constants
`DECAY`, `GAIN`, and `STAGE_THRESHOLDS` are defined in both `constants/flame.ts` (client) and `functions/src/ema.ts` (server). If thresholds change, both files need updating. The `useFlameScore` hook also has its own inline `getStage()` and `applyLazyDecay()` rather than importing from `constants/flame.ts`.

### Server-Side Types Are a Subset
`functions/src/types.ts` omits several fields present in the client `UserDocument` (e.g., `preferredSessionTime`, `workType`, `defaultSessionDurationMinutes`, `rewardMode`, `closingNotificationEnabled`, `calendarConnected`). The Cloud Functions don't currently read those fields, but if they ever need to, the server types will be out of date.

### Boilerplate Files
`App.tsx` and `index.ts` at the root are default Expo scaffolding. They are not used at runtime (expo-router's entry point takes over via `"main": "expo-router/entry"` in `package.json`). Can be removed.

---

## What Comes Next

| Sprint | Focus | Status |
|---|---|---|
| **Sprint 0** | Auth, schema, Cloud Functions, hooks, UI primitives | Complete |
| **Sprint 1** | Onboarding, home screen, session flow (pre → active → post), tab nav | Complete |
| **Sprint 2** | Rive flame animation, RevenueCat paywall, push notifications | Next |
| **Sprint 3** | AI coaching (Claude API), analytics (PostHog) | |
| **Sprint 4** | App blocking (iOS Focus Mode, Android Accessibility), settings screen | |
| **Sprint 5** | Launch prep (TestFlight, Play Console, App Store assets) | |
