# 📱 Mobile App UI Development Plan  
**Tech Stack:** React Native (Expo) + NativeWind  
**Scope:** Premium UI only (No backend integration)

---

## 🔷 Phase 1 — Project Foundation & Premium Design System
**Goal:** Create a strong, scalable base with a polished, premium look & feel.

### 1.1 Project Setup
- Initialize app using **Expo (React Native)**
- Install & configure:
  - NativeWind
  - TailwindCSS config
  - React Navigation
  - AsyncStorage
- Enable gesture handler & safe-area support

### 1.2 Folder Structure (Initial)
src/
├── assets/
│ ├── images/
│ ├── icons/
│ └── illustrations/
├── components/
├── screens/
├── navigation/
├── theme/
├── hooks/
├── utils/
└── store/

### 1.3 Design System (Premium UI)
- **Color Palette**
  - Primary / Secondary
  - Neutral shades
  - Success / Error
- **Typography**
  - H1 / H2 / H3
  - Body / Caption
- **Spacing & Radius**
  - Consistent padding & margin scale
  - Rounded cards & buttons
- **Shadows & Elevation**
  - Card shadows
  - Floating buttons

### 1.4 Reusable UI Components (Base)
- `PrimaryButton`
- `SecondaryButton`
- `TextField` (label, error, helper)
- `IconButton`
- `Card`
- `Divider`
- `Loader / Skeleton`

---

## 🔷 Phase 2 — App Routing, State & Core Logic
**Goal:** Define the app flow logic without backend but with real-world behavior.

### 2.1 Navigation Structure
- **Auth Stack**
  - Onboarding
  - Signup
  - Verify OTP
  - Registration (multi-step)
  - Login
- **App Stack**
  - Home

### 2.2 App State Rules
- First app open:
  - Show onboarding
- If user already signed up:
  - Skip onboarding → Login
- After successful signup:
  - Redirect to Home
- After app restart:
  - Ask Login (not Signup)

### 2.3 Local Storage Flags (AsyncStorage)
- `hasSeenOnboarding`
- `hasSignedUp`
- `notificationPermissionStatus`

### 2.4 Notification Permission Logic
- Ask notification permission **only once**
- If accepted or denied:
  - Store status
  - Never ask again

---

## 🔷 Phase 3 — Signup Flow UI (End-to-End)
**Goal:** Build a complete, high-quality signup experience.

### 3.1 Onboarding Screens (3 Slides)
- Company introduction
- Feature highlights
- Value proposition
- UI Elements:
  - Carousel
  - Pagination dots
  - Skip / Next buttons
- Final CTA:
  - Create Account
  - Already have an account → Login

### 3.2 Signup Screen (Single Page)
- Account type selector:
  - Partner
  - Customer
  - Referral Partner
- Signup options:
  - Continue with Google (UI only)
  - Continue with Email
- Email input
- Send OTP button
- Terms & privacy microcopy

### 3.3 Verify OTP Screen
- 6-digit OTP input
- Timer countdown
- Resend OTP
- Change email option
- Verify → Registration flow

### 3.4 Registration Flow (4–5 Screens)
**Each screen: 2–3 questions max**

1. **Personal Details**
   - Full Name
   - Phone Number
   - City

2. **Professional Details**
   - Role / Title
   - Company Name
   - Industry

3. **Account Intent**
   - What are you looking for?
   - Multi-select / chips

4. **Partner-Specific (Conditional)**
   - Business type
   - Operating region

5. **Review & Submit**
   - Summary card
   - Submit button

### 3.5 UX Enhancements
- Step progress indicator
- Inline validations
- Smooth transitions
- Success animation on submit

---

## 🔷 Phase 4 — Login Flow UI
**Goal:** Simple, fast, and familiar login experience.

### 4.1 Login Screen (Single Page)
- Continue with Google (UI only)
- Continue with Email
- Email input
- Send OTP

### 4.2 Verify OTP Screen
- Same OTP component as signup
- Timer & resend
- Verify → Home

### 4.3 Login Rules
- If user has already signed up:
  - Always show login on next app launch
- No onboarding after signup

---

## 🔷 Phase 5 — Home Screen & Final Polish
**Goal:** Make the app feel production-ready and premium.

### 5.1 Home Screen Layout
- Header:
  - Greeting
  - Profile avatar
- Quick Action Cards:
  - Complete Profile
  - Explore Services
  - Contact Support
- Updates / Activity Feed (static UI)
- Optional bottom navigation

### 5.2 Premium Finishing Touches
- Button press animations
- Screen transitions
- Skeleton loaders
- Empty states
- Haptic feedback (optional)
- App icon & splash screen
- Accessibility basics

---

## 📁 Suggested Final Folder Structure
src/
├── assets/
├── components/
│ ├── buttons/
│ ├── inputs/
│ ├── cards/
│ ├── otp/
│ └── loaders/
├── screens/
│ ├── onboarding/
│ ├── auth/
│ ├── registration/
│ └── home/
├── navigation/
├── theme/
├── hooks/
├── utils/
└── store/

---

## 🧭 Exact Screen List & Navigation Map
Splash
└── Onboarding (3)
├── Signup
│ ├── Verify OTP
│ └── Registration (Step 1 → Step 5)
│ └── Home
└── Login
├── Verify OTP
└── Home

---

## ✅ Step-by-Step Checklist (Sprint Style)

### Sprint 1
- Project setup
- NativeWind config
- Base UI components

### Sprint 2
- Navigation setup
- App state logic
- Notification permission handling

### Sprint 3
- Onboarding UI
- Signup UI
- OTP UI

### Sprint 4
- Registration multi-step flow
- Validations
- Submit flow

### Sprint 5
- Login flow
- Home screen
- Final polish & animations

---

## 🎨 Premium UI Kit (Reusable Components)
- Buttons (Primary, Secondary, Ghost)
- Text inputs
- OTP input
- Cards
- Progress indicators
- Chips / tags
- Modals
- Bottom sheets
- Loaders & skeletons

---

**Result:**  
A fully UI-complete, premium-feel mobile app with realistic auth flows, clean navigation, and scalable architecture — ready for backend integration anytime.
