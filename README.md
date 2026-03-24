# Scaffold
![Scaffold logo](assets/images/scaffold%20logo.svg)

> **This is the public demo repository for Scaffold.** It showcases the core user flows 
> with a hardcoded demo session — no account required to explore the app.

Grant and scholarship companion for BC trades apprentices. Scaffold auto-fills your 
profile into applications, drafts answers with AI, and keeps documents and deadlines 
in one place.

---

## What This Repo Is

This is the **demo build** of Scaffold, created for the BCIT D3 Innovation Showcase 
(where it placed 3rd). It runs against a live Vercel deployment with a pre-loaded demo 
profile so reviewers and judges can experience the full flow without needing to create 
an account or configure a backend.

If you're here from the portfolio or the showcase — you can try the live demo at 
[Scaffold Demo]((https://scaffold-theta.vercel.app/).

---

## Why Scaffold

Trades apprentices in BC leave grant money on the table — not because they don't 
qualify, but because applications are scattered, time-consuming, and hard to navigate 
alongside a full work schedule. Scaffold fixes that.

- **Auto-filled applications** — contact, education, and apprenticeship details pull 
  straight from your profile, no re-typing.
- **AI-written drafts** — per-question generation with sensible defaults and smooth 
  input resizing.
- **Document checklist** — see exactly what's required and upload without losing your 
  place in the flow.
- **Direct apply** — tap through to the grant portal without losing context.

Built with Expo Router, NativeWind, Supabase, and the OpenAI API.

---

## Running the Demo Locally

**Prerequisites:** Node 18+, npm, and Expo tooling.
```bash
git clone https://github.com/amolwalia/Scaffold.git
cd Scaffold
npm install
npm run start   # opens Expo Dev Tools — press i for iOS, a for Android, or scan the QR
```

The demo uses a hardcoded session, so most flows work out of the box. To connect 
your own backend, see [Configuration](#configuration) below.

---

## Configuration

To run with a live Supabase backend and real AI generation, create a `.env` 
(or `.env.local`) with:
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_RESET_REDIRECT_URL=   # optional
EXPO_PUBLIC_OPENAI_API_KEY=                # required for AI answers
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run start` | Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator/device |
| `npm run web` | Web dev build |
| `npm run build` | Export web build |
| `npm run lint` | Lint via Expo |
| `npm run reset-project` | Reset project state |

---

## App Flow

The demo walks through three core screens:

1. **Grant Details & Apply** — grant overview with a "You're almost done!" CTA that 
   links to the real portal.
2. **Generated Application** — auto-filled profile sections (Basic Info, Education, 
   References), AI-drafted answers, and a document checklist with upload prompts.
3. **Profile** — editable sections with progress tracking and document-to-profile 
   automation.

Bottom navigation keeps grants, profile, and documents within one thumb's reach.

---

## Project Structure
```
app/          — Expo Router pages (e.g. generated-application.tsx)
components/   — shared UI (BottomNavigation, icons, cards)
constants/    — theme tokens, grant data
contexts/     — app-wide providers (ProfileContext)
hooks/        — reusable logic
utilities/    — helper functions
assets/       — logos, illustrations
```

---

## Team

Scaffold was built by a seven-person BCIT team as part of the D3/FSWD x ConnectHer Technology Innovation Showcase.

---

## Links

- 🌐 Live demo: [Scaffold Demo]((https://scaffold-theta.vercel.app/)
- 📸 Instagram: [@tryscaffold](https://www.instagram.com/tryscaffold/?hl=en)
