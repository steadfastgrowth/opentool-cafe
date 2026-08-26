/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database;
  APP_URL: string;
  AUTH_DEV_REVEAL: string;
}
