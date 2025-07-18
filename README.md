# Interstellar Nerd

A modern space-themed blog and forum built with **Next.js App Router**, **Tailwind CSS**, **Supabase**, **Prisma**.

## Features

- Dark mode first design (midnight blue & neon purple)
- Blog pages use Incremental Static Regeneration (60s revalidate)
- Forum with threads and comments stored via Prisma + PostgreSQL
- Authentication with NextAuth (Google OAuth & email/password)
- Responsive layout with micro-interactions using Framer Motion
- GA4 analytics & AdSense gated by cookie consent
- Security headers, rate limiting, and image optimization

## Cookie Consent

Analytics and AdSense scripts are injected only after a visitor clicks
"Accept marketing cookies" in the banner. Until then, no requests to Google
services are made.

## Prerequisites

- **Node.js 18+**
- Account for [Supabase](https://supabase.com)
- PostgreSQL database URL for Prisma

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <this-repo-url>
   cd interstellar-nerd
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**

   - Copy `.env.example` to `.env` and fill in all values.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the site.

5. **Build for production**

   ```bash
   npm run build && npm start
   ```

## Folder Structure

- `app/` – Next.js App Router routes and layout components.
- `components/` – Reusable UI pieces such as `Navbar`, `Footer`, etc.
- `lib/` – Helper clients for Supabase, Prisma, GA.
- `prisma/` – Prisma schema.
- `styles/` – Global CSS loaded in the root layout.
- `public/` – Static assets.

## Environment Variables

The project doesn't use Redis or contact webhooks, so earlier placeholders
`REDIS_URL`, `CONTACT_WEBHOOK_URL` and `NEXT_PUBLIC_SITE_URL` were removed.

See `.env.example` for all required keys:

- `DATABASE_URL` – Postgres connection string
- `NEXT_PUBLIC_GA_ID` – Google Analytics ID
- `NEXT_PUBLIC_ADSENSE_ID` – Google AdSense client ID
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SUPABASE_SERVICE_ROLE_KEY` for NextAuth adapter
- `RATE_LIMIT_WINDOW_MS` – rate limit window in milliseconds
- `RATE_LIMIT_MAX` – max requests per window per IP

## Rate Limiting

API routes under `/app/api/*` are protected by a simple rate limiter. The
defaults allow `RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_MS` from a
single IP address. Adjust these environment variables to tune the protection
level.

## Authentication

Users can sign in with Google or with an email/password. The login and signup
pages call `signIn` and `signUp` from **NextAuth**. After creating an account
with credentials, you will be redirected to your profile page.

## Database Migrations

Run Prisma migrations:

```bash
npx prisma migrate dev
```


## Importing Pre-Uploaded Images

The `/api/import-images` route adds the hero and logo images that were manually
uploaded to the `images` bucket. Trigger it from the command line:

```bash
curl -X POST http://localhost:3000/api/import-images
```

This inserts both files into the `media_assets` table.



## Scripts

- `dev` – Start Next.js in development.
- `build` – Create an optimized production build.
- `start` – Start the built app.
- `lint` – Run ESLint.
- `format` – Format with Prettier.
- `prisma:migrate` – Run Prisma migrations.
- `find-old-images` – `pnpm ts-node scripts/find-old-images.ts` to locate stale images.
  Run `npm run format` to apply Prettier formatting to all files.

## Deployment Notes

Deploy easily to **Vercel** or any Node hosting provider (AWS, GCP).
Set all environment variables in your hosting platform.

### Vercel Setup

1. Use **Node.js 18**. The repo now includes an `.nvmrc` file and `engines` entry so Vercel will automatically use the correct runtime.
2. Install dependencies using `npm install --legacy-peer-deps` and run the build
   step (`npm run build`). The custom install command is defined in `vercel.json`.
3. All output is served from the default `.next` folder.

## Updating Dependencies

Run:

```bash
npm outdated
npm update
```

## Troubleshooting

- **Prisma connection errors** – check `DATABASE_URL`.
- **Auth problems** – ensure `NEXTAUTH_URL` matches site URL and Supabase keys are correct.
- **Build failures** – delete `.next` folder and reinstall packages.
- To show the hero image on the homepage, import it in `app/page.tsx` with `import Hero from "../components/Hero"`.

---

Enjoy exploring the cosmos with **Interstellar Nerd**!
#   N E R D - P R O J E C T  
 