# Open Tool Cafe

https://opentool.cafe

Welcome to open tool cafe, can I take your order?

Share and download open source tools, connect with other founders and builders, enjoy some java.

MIT licensed. See `LICENSE`. Privacy and house rules live on `/privacy` and `/terms`.

## Auth

- GitHub OAuth (builders / claim repo) — callback `https://opentool.cafe/auth/github/callback`
- Email + password (new emails only; existing GitHub/code accounts set a password on `/you`)
- Email 6-digit code (magic link in the same mail)

No Google. No SMS. From: `Open Tool Cafe <login@opentool.cafe>`

## Deploy

Cloudflare Worker `opentool-cafe` + D1. Mini is deploy/dev only.

```bash
cp .env.example .env
npm install
npx prisma generate
npx wrangler d1 execute opentool-cafe --remote --file prisma/d1-ratelimit.sql
npx wrangler d1 execute opentool-cafe --remote --file prisma/d1-follow.sql
npx wrangler d1 execute opentool-cafe --remote --file prisma/d1-notices.sql
npx wrangler d1 execute opentool-cafe --remote --file prisma/d1-community.sql
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

Set Worker secrets (never commit them): `AUTH_SECRET`, `ADMIN_PASSWORD`, `RESEND_API_KEY`, `RESEND_FROM`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

Stripe webhook URL: `https://opentool.cafe/api/stripe/webhook` (`checkout.session.completed`).

Do not commit `.env` or `.dev.vars`. Do not copy a live merchant key into a fork.
