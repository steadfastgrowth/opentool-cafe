# Open Tool Cafe

Local cafe of tools you can actually run. Niche social for builders — collab, help, services.

## Run

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

http://127.0.0.1:4330

Tailnet (this Mini): https://jpcmini-1.tailb2813e.ts.net:4430/

Local login: join with email, then click the link on the next page (`AUTH_DEV_REVEAL=1`). Mail is not wired.

OAuth: set `GITHUB_CLIENT_ID` / `GOOGLE_CLIENT_ID` (+ secrets) and `APP_URL`. Callbacks:
- `{APP_URL}/auth/github/callback`
- `{APP_URL}/auth/google/callback`

Admin desk: `/admin` password from `ADMIN_PASSWORD`.

## Hosting

No Supabase required. This is Next.js + Prisma + SQLite.

**Cloudflare is the host:**
- Pages / Workers via OpenNext (`@opennextjs/cloudflare`)
- D1 for the database (SQLite-shaped)
- R2 for profile photos
- Stripe stays Stripe
- OAuth stays GitHub/Google

Keep building locally on SQLite. Swap the Prisma datasource to D1 when you ship.

## Slice

- Magic-link + GitHub/Google OAuth
- Profile builder, photo, 8-bit named coffee cup
- Bulletin / help / collab / service board
- Public `/u/[slug]`
- Take tools, claim GitHub listings, meetings
- Tip jar (logs now; Stripe checkout when `STRIPE_SECRET_KEY` is set)
