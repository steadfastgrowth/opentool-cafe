# Open Tool Cafe

Local cafe of tools you can actually run. GitHub / Hugging Face / self-hosted.

## Run

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Local login: join with email, then click the link on the next page (`AUTH_DEV_REVEAL=1`). Mail is not wired.

Admin desk: `/admin` password from `ADMIN_PASSWORD`.

## What is in this slice

- Magic-link accounts
- One profile: take tools, list tools, meetings
- Public `/u/[slug]` with GitHub / X / HF / LinkedIn
- Take button, opted-in builder inbox
- Claim a GitHub listing if the profile handle matches the repo owner
- Tip jar (logged, Stripe later)

Paid lead lists are parked.
