import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { newToken, setSessionCookie, uniqueUserSlug, consumeNext } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { track } from "@/lib/track";
import { cookieSecure } from "@/lib/request";
import { notifyDesk } from "@/lib/notify";

const STATE = "oauth_state";

export async function beginOAuth(req: NextRequest) {
  const origin = appUrl(req.url);
  const state = newToken();
  const id = process.env.GITHUB_CLIENT_ID;
  if (!id) return NextResponse.redirect(new URL("/join?err=oauth", origin));
  const dest = new URL("https://github.com/login/oauth/authorize");
  dest.searchParams.set("client_id", id);
  dest.searchParams.set("redirect_uri", `${origin}/auth/github/callback`);
  dest.searchParams.set("scope", "read:user user:email");
  dest.searchParams.set("state", state);
  const res = NextResponse.redirect(dest);
  res.cookies.set(STATE, `github:${state}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: cookieSecure(),
  });
  return res;
}

async function checkState(incoming: string | null) {
  const jar = await cookies();
  const raw = jar.get(STATE)?.value || "";
  jar.delete(STATE);
  const [p, s] = raw.split(":");
  return Boolean(incoming && p === "github" && s && s === incoming);
}

export async function finishGithub(req: NextRequest) {
  const origin = appUrl(req.url);
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !(await checkState(state))) {
    return NextResponse.redirect(new URL("/join?err=oauth", origin));
  }
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/auth/github/callback`,
    }),
  });
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) return NextResponse.redirect(new URL("/join?err=oauth", origin));

  const headers = { Authorization: `Bearer ${tokenJson.access_token}`, "User-Agent": "opentool-cafe" };
  const user = (await (await fetch("https://api.github.com/user", { headers })).json()) as {
    id: number;
    login: string;
    name?: string;
    avatar_url?: string;
    html_url?: string;
    email?: string | null;
  };
  let email = user.email || "";
  if (!email) {
    const emails = (await (await fetch("https://api.github.com/user/emails", { headers })).json()) as {
      email: string;
      primary: boolean;
      verified: boolean;
    }[];
    email = emails.find((e) => e.primary && e.verified)?.email || emails.find((e) => e.verified)?.email || "";
  }
  if (!email) return NextResponse.redirect(new URL("/join?err=oauth", origin));

  await upsertOAuthUser({
    email,
    name: user.name || user.login,
    slugBase: user.login,
    githubId: String(user.id),
    github: user.html_url || `https://github.com/${user.login}`,
    githubHandle: user.login,
    avatarUrl: user.avatar_url || null,
  });
  await track("join_github", { path: "/auth/github/callback" });
  return NextResponse.redirect(new URL(await consumeNext(), origin));
}

async function upsertOAuthUser(input: {
  email: string;
  name: string;
  slugBase: string;
  githubId?: string;
  github?: string;
  githubHandle?: string;
  avatarUrl?: string | null;
}) {
  const prisma = await getPrisma();
  const email = input.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user && input.githubId) user = await prisma.user.findUnique({ where: { githubId: input.githubId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: input.name,
        slug: await uniqueUserSlug(input.slugBase),
        githubId: input.githubId,
        github: input.github,
        githubHandle: input.githubHandle?.toLowerCase(),
        avatarUrl: input.avatarUrl || undefined,
      },
    });
    await notifyDesk(
      "Cafe: new regular (GitHub)",
      `${user.email} · @${user.slug} · ${user.githubHandle || ""}\nhttps://opentool.cafe/u/${user.slug}`,
    );
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        githubId: input.githubId || user.githubId,
        github: input.github || user.github,
        githubHandle: input.githubHandle?.toLowerCase() || user.githubHandle,
        avatarUrl: user.avatarUrl || input.avatarUrl || undefined,
        name: user.name || input.name,
      },
    });
  }
  const sessionToken = newToken();
  await prisma.session.create({
    data: {
      token: sessionToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
  await setSessionCookie(sessionToken);
}
