# Scaffold

![Scaffold logo](assets/images/scaffold%20logo.svg)

Grant and scholarship companion for tradespeople, apprentices, and students. Scaffold auto-fills your profile into applications, drafts answers with AI, and keeps documents and deadlines in one calm flow.

## Why Scaffold

- Auto-filled applications: pull contact, education, and apprenticeship details straight from your profile.
- AI-written drafts: per-question generation with sensible defaults and smooth input resizing.
- Document checklist: see what’s required and upload from the flow.
- Direct apply: tap through to the grant portal without losing context.
- Built with Expo Router, NativeWind styling, and a trades-focused theme.

## Quickstart

Prerequisites: Node 18+, npm, and Expo tooling (`npm i -g expo-cli` if you like the global helper).

```bash
git clone https://github.com/amolwalia/Scaffold.git
cd Scaffold
npm install
npm run start   # opens Expo Dev Tools; press i for iOS, a for Android, or scan the QR
```

## Configuration

Create a `.env` (or `.env.local`) with:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_RESET_REDIRECT_URL` (optional)
- `EXPO_PUBLIC_OPENAI_API_KEY` (required for AI answers)

## Scripts

- `npm run start` — Expo dev server
- `npm run ios` / `npm run android` — run on simulator/device
- `npm run web` — web dev build
- `npm run build` — export web build
- `npm run lint` — lint via Expo
- `npm run reset-project` — reset project state

## Product Tour

- **Grant Details & Apply**: “You’re almost done!” hero with portal CTA.
- **Generated Application**: auto-filled profile sections (Basic Profile, Education, References), AI-written answers, document checklist, upload CTA.
- **Profile**: editable sections with progress tracking and document ingest-to-profile automation.
- **Bottom Navigation**: keeps grants, profile, and docs within reach.

## Structure

- `app/` — Expo Router pages (e.g., `generated-application.tsx`)
- `components/` — shared UI (BottomNavigation, icons, cards)
- `constants/` — theme tokens, grant data
- `contexts/` — app-wide providers (ProfileContext)
- `hooks/` and `utilities/` — reusable logic and helpers
- `assets/` — logos, illustrations

## Links

- Website: https://www.tryscaffold.ca/
- Instagram: https://www.instagram.com/tryscaffold/?hl=en
