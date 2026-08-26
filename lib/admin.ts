import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { cookieSecure } from "./request";

const COOKIE = "opentool_admin";
const HALF_DAY = 60 * 60 * 12;

function secret() {
  return (process.env.AUTH_SECRET || "").trim();
}

function sign(payload: string) {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update(payload).digest("hex");
}

export function adminPasswordOk(password: string) {
  const expected = (process.env.ADMIN_PASSWORD || "").trim();
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setAdminCookie() {
  const exp = Date.now() + HALF_DAY * 1000;
  const payload = `1.${exp}`;
  const sig = sign(payload);
  if (!sig) return false;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: HALF_DAY,
    secure: cookieSecure(),
  });
  return true;
}

export async function isAdmin() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value || "";
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [flag, exp, sig] = parts;
  if (flag !== "1" || !exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expect = sign(`${flag}.${exp}`);
  if (!expect || expect.length !== sig.length) return false;
  return timingSafeEqual(Buffer.from(expect), Buffer.from(sig));
}
