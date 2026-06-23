# Secure Notes Vault (Next.js)

An encrypted notes / reminders / notifications vault with AI summarization
and auto-generated flowcharts — a Next.js rebuild of the original Flask
project, using only free services.

## Stack (all free)

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, TS) | Single deploy target, free on Vercel |
| Auth | Auth.js (NextAuth) credentials + bcrypt | No paid auth provider needed |
| Database | Postgres (free Neon tier) via Prisma | Vercel's filesystem is ephemeral, so SQLite won't persist there — Neon's free tier covers this comfortably |
| Encryption | Node `crypto`, AES-256-GCM, per-user key via HMAC-SHA256(email) | Same idea as the original Fernet/email-derived key, no external KMS |
| AI summarization | Hugging Face free Inference API (`sshleifer/distilbart-cnn-12-6`), with a local fallback summarizer if no token is set | Free tier, and the app still works with zero signups |
| Flowcharts | Mermaid.js rendered client-side | No Graphviz binary, no server cost |
| Password reset email | Gmail SMTP + free App Password via Nodemailer | No paid transactional email service; falls back to console-logging the link if not configured |
| Hosting | Vercel free tier | Zero-cost deploy from GitHub |

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | A free Postgres connection string from [neon.tech](https://neon.tech). Tables are created automatically on build/deploy via `prisma db push` (see `package.json`'s `build` script) — no manual migration step needed. |
| `NEXTAUTH_SECRET` | Yes | Generate with `npx auth secret` or `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` locally; your deployed URL in production. |
| `ENCRYPTION_SECRET` | Yes | Generate with `openssl rand -hex 32`. Losing this makes all stored data unrecoverable, so back it up somewhere safe. |
| `HUGGINGFACE_API_KEY` | No | Free token from huggingface.co/settings/tokens. Leave blank to use the built-in local summarizer instead. |
| `EMAIL_USER` / `EMAIL_PASS` | No | Gmail address + an App Password (myaccount.google.com/apppasswords, requires 2-Step Verification). Leave blank to have reset links printed to the server console instead of emailed. |

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL (Neon) and the two secrets
npx prisma db push     # creates the tables in your Neon database
npm run dev
```

Visit http://localhost:3000.

## Deploying for free on Vercel

1. Push this repo to GitHub.
2. Import the repo at vercel.com/new.
3. Add the environment variables above in the Vercel project settings.
4. Deploy — Vercel's free (Hobby) tier covers this comfortably.

## Project structure

```
src/
  app/
    api/             REST endpoints (auth, notes, reminders, notifications)
    notes/            Notes UI (list, new, detail+AI)
    reminders/         Reminders UI
    notifications/     Notifications UI
    login/ register/ forgot-password/ reset-password/[token]/
  components/         Navbar, AuthProvider, FlowchartViewer (Mermaid)
  lib/                prisma client, auth.ts, encryption.ts, ai.ts, mail.ts
prisma/schema.prisma
```

## Note on this build

This project was scaffolded in a sandboxed environment whose network allowlist
does not include Prisma's engine-binary CDN, so `prisma generate` / `npm run build`
could not be verified end-to-end here. Run `npm install && npm run build` after
cloning to generate the Prisma client and confirm the build (this works fine on
a normal machine or on Vercel, both of which have unrestricted network access).
