import { cookies } from "next/headers";
import { getPrisma } from "./db";
import { randomBytes } from "crypto";

const COOKIE = "opentool_sid";
const WEEK = 60 * 60 * 24 * 7;

export function newToken() {
  return randomBytes(24).toString("hex");
}

export async function getSessionUser() {
  const prisma = await getPrisma();
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function setSessionCookie(token: string) {
  const prisma = await getPrisma();
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: WEEK,
  });
}

export async function clearSessionCookie() {
  const prisma = await getPrisma();
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function slugify(input: string) {
  const s = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return s || "guest";
}

export async function uniqueUserSlug(base: string) {
  const prisma = await getPrisma();
  let slug = slugify(base);
  let n = 0;
  while (await prisma.user.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
  return slug;
}

export function githubOwnerFromUrl(url: string) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("github.com")) return null;
    const part = u.pathname.split("/").filter(Boolean)[0];
    return part ? part.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function padTicket(n: number) {
  return String(n).padStart(3, "0");
}

export function tagList(tags: string) {
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}
