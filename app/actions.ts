"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import {
  clearSessionCookie,
  consumeNext,
  getSessionUser,
  githubOwnerFromUrl,
  newToken,
  setSessionCookie,
  slugify,
  uniqueUserSlug,
} from "@/lib/auth";
import { sendLeadNotice, sendLoginEmail, sendMeetingNotice } from "@/lib/mail";
import { hashPassword, sixDigitCode, verifyPassword } from "@/lib/password";
import { track } from "@/lib/track";
import { clientIp } from "@/lib/request";
import { rateLimit, WINDOW_15M } from "@/lib/rate-limit";
import { parseHttpUrl } from "@/lib/urls";
import { notifyDesk } from "@/lib/notify";

async function openSession(userId: string) {
  const prisma = await getPrisma();
  const sessionToken = newToken();
  await prisma.session.create({
    data: {
      token: sessionToken,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
  });
  await setSessionCookie(sessionToken);
}

export async function requestMagicLink(formData: FormData) {
  const prisma = await getPrisma();
  const ip = await clientIp();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/join?err=email");
  }
  const ipOk = await rateLimit(`magic:ip:${ip}`, 8, WINDOW_15M);
  const emOk = await rateLimit(`magic:email:${email}`, 5, WINDOW_15M);
  if (!ipOk.ok || !emOk.ok) redirect("/join?err=rate");
  const optInBuilders = formData.get("optIn") === "on";
  const token = newToken();
  const code = sixDigitCode();
  await prisma.magicLink.create({
    data: {
      token,
      email,
      code,
      optIn: optInBuilders,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });
  try {
    await sendLoginEmail({ email, code, token, optIn: optInBuilders });
  } catch {
    redirect("/join?err=mail");
  }
  redirect(`/join/sent?email=${encodeURIComponent(email)}`);
}

export async function verifyLoginCode(formData: FormData) {
  const prisma = await getPrisma();
  const ip = await clientIp();
  const gated = await rateLimit(`code:ip:${ip}`, 12, WINDOW_15M);
  if (!gated.ok) redirect("/join?err=rate");
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") || "").replace(/\s/g, "");
  if (!email || !/^\d{6}$/.test(code)) {
    redirect(`/join/sent?email=${encodeURIComponent(email)}&err=code`);
  }
  const row = await prisma.magicLink.findFirst({
    where: { email, code, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });
  if (!row) redirect(`/join/sent?email=${encodeURIComponent(email)}&err=code`);
  await consumeMagic(row.token);
}

export async function consumeMagic(token: string, _ignoredOpt?: boolean) {
  const prisma = await getPrisma();
  const row = await prisma.magicLink.findUnique({ where: { token } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    redirect("/join?err=link");
  }
  await prisma.magicLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });
  const useOpt = row.optIn;
  let user = await prisma.user.findUnique({ where: { email: row.email } });
  if (!user) {
    const local = row.email.split("@")[0];
    user = await prisma.user.create({
      data: {
        email: row.email,
        slug: await uniqueUserSlug(local),
        name: local,
        optInBuilders: useOpt,
      },
    });
    await notifyDesk(
      "Cafe: new regular (email code)",
      `${user.email} · @${user.slug}\nhttps://opentool.cafe/u/${user.slug}`,
    );
  } else if (useOpt && !user.optInBuilders) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { optInBuilders: true },
    });
  }
  await openSession(user.id);
  await track("join_code", { path: "/join", userId: user.id });
  redirect(await consumeNext());
}

export async function registerWithPassword(formData: FormData) {
  const prisma = await getPrisma();
  const ip = await clientIp();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const optInBuilders = formData.get("optIn") === "on";
  if (!email || !email.includes("@")) redirect("/join?err=email");
  if (password.length < 8) redirect("/join?err=password");
  const confirm = String(formData.get("confirm") || "");
  if (password !== confirm) redirect("/join?err=match");
  const gated = await rateLimit(`login:ip:${ip}`, 8, WINDOW_15M);
  if (!gated.ok) redirect("/join?err=rate");
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(existing.passwordHash ? "/join?err=exists" : "/join?err=usecode");
  }
  const passwordHash = await hashPassword(password);
  const local = email.split("@")[0];
  const user = await prisma.user.create({
    data: {
      email,
      slug: await uniqueUserSlug(local),
      name: local,
      passwordHash,
      optInBuilders,
    },
  });
  await notifyDesk(
    "Cafe: new regular (password)",
    `${user.email} · @${user.slug}\nhttps://opentool.cafe/u/${user.slug}`,
  );
  await openSession(user.id);
  await track("join_password", { path: "/join", userId: user.id });
  redirect(await consumeNext());
}

export async function loginWithPassword(formData: FormData) {
  const prisma = await getPrisma();
  const ip = await clientIp();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !email.includes("@")) redirect("/login?err=email");
  const gated = await rateLimit(`login:ip:${ip}`, 8, WINDOW_15M);
  if (!gated.ok) redirect("/login?err=rate");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?err=login");
  }
  await openSession(user.id);
  await track("join_password", { path: "/join", userId: user.id });
  redirect(await consumeNext());
}

export async function setPassword(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const password = String(formData.get("password") || "");
  if (password.length < 8) redirect("/you?err=password");
  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { id: me.id }, data: { passwordHash } });
  redirect("/you?ok=password");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

export async function saveProfile(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const offering = String(formData.get("offering") || "").trim() || null;
  const lookingFor = String(formData.get("lookingFor") || "").trim() || null;
  const skills = String(formData.get("skills") || "").trim() || null;
  const name = String(formData.get("name") || "").trim() || me.name;
  const bio = String(formData.get("bio") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const github = String(formData.get("github") || "").trim() || null;
  const x = String(formData.get("x") || "").trim() || null;
  const huggingface = String(formData.get("huggingface") || "").trim() || null;
  const linkedin = String(formData.get("linkedin") || "").trim() || null;
  const website = String(formData.get("website") || "").trim() || null;
  const calendarUrl = String(formData.get("calendarUrl") || "").trim() || null;
  const takesMeetings = formData.get("takesMeetings") === "on";
  const optInBuilders = formData.get("optIn") === "on";
  let slug = slugify(String(formData.get("slug") || me.slug));
  if (slug !== me.slug) slug = await uniqueUserSlug(slug);
  const handleFromGithub = github
    ? github.replace(/^https?:\/\/(www\.)?github\.com\//i, "").split("/")[0]
    : null;
  await prisma.user.update({
    where: { id: me.id },
    data: {
      name,
      bio,
      offering,
      lookingFor,
      skills,
      phone,
      github,
      x,
      huggingface,
      linkedin,
      website,
      calendarUrl,
      takesMeetings,
      optInBuilders,
      slug,
      githubHandle: handleFromGithub ? handleFromGithub.toLowerCase() : me.githubHandle,
    },
  });
  revalidatePath("/you");
  revalidatePath(`/u/${slug}`);
  redirect("/you");
}

export async function listRepo(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const name = String(formData.get("name") || "").trim();
  const officialUrl = String(formData.get("url") || "").trim();
  const oneLiner = String(formData.get("oneLiner") || "").trim();
  const tags = String(formData.get("tags") || "").trim() || "self-hosted";
  if (!name || !officialUrl || !oneLiner) redirect("/list?err=fields");
  const parsed = parseHttpUrl(officialUrl);
  if (!parsed) redirect("/list?err=fields");
  const cleanUrl = parsed.toString();
  const slug = await uniqueListingSlug(slugify(name));
  const last = await prisma.listing.aggregate({ _max: { number: true } });
  const number = (last._max.number || 0) + 1;
  const ownerPath = githubOwnerFromUrl(cleanUrl);
  const claimed = Boolean(
    ownerPath && me.githubHandle && ownerPath === me.githubHandle.toLowerCase()
  );
  await prisma.listing.create({
    data: {
      number,
      slug,
      name,
      officialUrl: cleanUrl,
      oneLiner,
      body: oneLiner,
      tags,
      ownerId: claimed ? me.id : null,
      claimed,
      offersMeetings: me.takesMeetings,
    },
  });
  revalidatePath("/find");
  redirect(`/l/${slug}`);
}

async function uniqueListingSlug(base: string) {
  const prisma = await getPrisma();
  let slug = base || "tool";
  let n = 0;
  while (await prisma.listing.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function claimListing(listingId: string) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) redirect("/find");
  if (listing.claimed && listing.ownerId && listing.ownerId !== me.id) {
    redirect(`/l/${listing.slug}?err=claimed`);
  }
  const ownerPath = githubOwnerFromUrl(listing.officialUrl);
  const ok =
    ownerPath && me.githubHandle && ownerPath === me.githubHandle.toLowerCase();
  if (!ok) redirect(`/l/${listing.slug}?err=github`);
  await prisma.listing.update({
    where: { id: listing.id },
    data: { claimed: true, ownerId: me.id },
  });
  revalidatePath(`/l/${listing.slug}`);
  redirect(`/l/${listing.slug}`);
}

export async function takeListing(listingId: string) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { owner: true },
  });
  if (!listing) redirect("/find");
  const take = await prisma.take.upsert({
    where: { listingId_userId: { listingId, userId: me.id } },
    update: { optedIn: me.optInBuilders },
    create: {
      listingId,
      userId: me.id,
      optedIn: me.optInBuilders,
    },
  });
  if (take.optedIn && listing.owner?.email && listing.owner.id !== me.id) {
    try {
      await sendLeadNotice({
        to: listing.owner.email,
        listingName: listing.name,
        listingSlug: listing.slug,
        fromName: me.name || me.slug,
        fromSlug: me.slug,
        fromEmail: me.email,
      });
    } catch {
      // take still counts if mail fails
    }
  }
  revalidatePath(`/l/${listing.slug}`);
  revalidatePath("/you");
  await track("take", { path: `/l/${listing.slug}`, listingId: listing.id, userId: me.id });
  redirect(`/out/${listing.slug}`);
}

export async function bookMeeting(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const toUserId = String(formData.get("toUserId") || "");
  const listingId = String(formData.get("listingId") || "") || null;
  const kind = String(formData.get("kind") || "buy");
  const note = String(formData.get("note") || "").trim() || null;
  if (!toUserId || toUserId === me.id) redirect("/you");
  const host = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!host) redirect("/you");
  const listing = listingId
    ? await prisma.listing.findUnique({ where: { id: listingId } })
    : null;
  await prisma.meetingRequest.create({
    data: {
      fromUserId: me.id,
      toUserId,
      listingId,
      kind: kind === "sell" ? "sell" : "buy",
      note,
    },
  });
  try {
    await sendMeetingNotice({
      to: host.email,
      kind: kind === "sell" ? "sell" : "buy",
      fromName: me.name || me.slug,
      fromSlug: me.slug,
      listingName: listing?.name,
      note,
    });
  } catch {
    // request still counts if mail fails
  }
  revalidatePath("/you");
  await track("meet", { path: "/you", listingId, userId: me.id });
  redirect("/you?ok=meet");
}

export async function uploadAvatar(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) redirect("/you?err=photo");
  if (file.size > 3 * 1024 * 1024) redirect("/you?err=photo");
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniffImage(buf);
  if (!kind) redirect("/you?err=photo");
  try {
    const { mkdir, writeFile } = await import("fs/promises");
    const { join } = await import("path");
    const dir = join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(dir, { recursive: true });
    const rel = `/uploads/avatars/${me.id}.${kind}`;
    await writeFile(join(process.cwd(), "public", rel), buf);
    await prisma.user.update({ where: { id: me.id }, data: { avatarUrl: rel } });
  } catch {
    redirect("/you?err=photo");
  }
  revalidatePath("/you");
  revalidatePath(`/u/${me.slug}`);
  redirect("/you");
}

function sniffImage(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function createPost(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const kindRaw = String(formData.get("kind") || "bulletin");
  const kind = ["bulletin", "help", "collab", "service"].includes(kindRaw) ? kindRaw : "bulletin";
  const tags = String(formData.get("tags") || "").trim();
  if (!title || !body) redirect("/board/new?err=fields");
  const post = await prisma.post.create({
    data: { authorId: me.id, title, body, kind, tags },
  });
  revalidatePath("/board");
  redirect(`/board/${post.id}`);
}

export async function deletePost(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const id = String(formData.get("id") || "");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== me.id) redirect("/board");
  await prisma.post.delete({ where: { id } });
  revalidatePath("/board");
  redirect("/board");
}

export async function leaveTip(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  let amount = String(formData.get("amount") || "").trim();
  if (amount === "other") amount = String(formData.get("otherAmount") || "").trim();
  const email = String(formData.get("email") || me?.email || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) redirect("/tip?err=amount");
  const tip = await prisma.tip.create({
    data: {
      userId: me?.id,
      email,
      amount,
      note,
      status: process.env.STRIPE_SECRET_KEY ? "pending" : "logged",
    },
  });
  if (process.env.STRIPE_SECRET_KEY) {
    const origin = process.env.APP_URL || "http://127.0.0.1:4330";
    const cents = Math.round(Number(amount) * 100);
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        mode: "payment",
        success_url: `${origin}/tip?ok=1`,
        cancel_url: `${origin}/tip?err=cancel`,
        customer_email: email || "",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": String(cents),
        "line_items[0][price_data][product_data][name]": "Open Tool Cafe tip",
        "metadata[tipId]": tip.id,
      }),
    });
    const session = (await res.json()) as { url?: string; id?: string };
    if (session.id) {
      await prisma.tip.update({ where: { id: tip.id }, data: { stripeId: session.id } });
    }
    if (session.url) redirect(session.url);
  }
  redirect("/tip?ok=1");
}

export async function toggleFollow(formData: FormData) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const slug = String(formData.get("slug") || "");
  const person = await prisma.user.findUnique({ where: { slug } });
  if (!person || person.id === me.id) redirect(slug ? `/u/${slug}` : "/search");
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: me.id, followingId: person.id } },
  });
  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { followerId: me.id, followingId: person.id } });
  }
  revalidatePath(`/u/${slug}`);
  revalidatePath("/board");
  redirect(`/u/${slug}`);
}
