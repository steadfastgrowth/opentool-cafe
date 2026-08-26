# Open Tool Cafe

https://opentool.cafe

Welcome to open tool cafe, can I take your order?

Share and download open source tools, connect with other founders and builders, enjoy some java.

## Auth

- GitHub OAuth (builders / claim repo) — callback `https://opentool.cafe/auth/github/callback`
- Email + password
- Email 6-digit code (magic link in the same mail)

No Google. No SMS. From: `Open Tool Cafe <login@opentool.cafe>`

## Deploy

Cloudflare Worker `opentool-cafe` + D1. Mini is deploy/dev only.

```bash
npm install
npx prisma generate
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

Do not commit `.env` or `.dev.vars`.
