"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  clearSessionCookie,
  getSessionUser,
  githubOwnerFromUrl,
  newToken,
  setSessionCookie,
  slugify,
  uniqueUserSlug,
} from "@/lib/auth";

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/join?err=email");
  }
  const optInBuilders = formData.get("optIn") === "on";
  const token = newToken();
  await prisma.magicLink.create({
    data: {
      token,
      email,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });
  // stash opt-in on a pending flag via magic email lookup later: store in token row? schema has no optIn.
  // encode in redirect query for consume. Also persist on user at consume.
  redirect(`/join/sent?t=${token}&opt=${optInBuilders ? "1" : "0"}`);
}

export async function consumeMagic(token: string, optIn: boolean) {
  const row = await prisma.magicLink.findUnique({ where: { token } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    redirect("/join?err=link");
  }
  await prisma.magicLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });
  let user = await prisma.user.findUnique({ where: { email: row.email } });
  if (!user) {
    const local = row.email.split("@")[0];
    user = await prisma.user.create({
      data: {
        email: row.email,
        slug: await uniqueUserSlug(local),
        name: local,
        optInBuilders: optIn,
      },
    });
  } else if (optIn && !user.optInBuilders) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { optInBuilders: true },
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
  redirect("/you");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

export async function saveProfile(formData: FormData) {
  const me = await getSessionUser();
  if (!me) redirect("/join");
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
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const name = String(formData.get("name") || "").trim();
  const officialUrl = String(formData.get("url") || "").trim();
  const oneLiner = String(formData.get("oneLiner") || "").trim();
  const tags = String(formData.get("tags") || "").trim() || "self-hosted";
  if (!name || !officialUrl || !oneLiner) redirect("/list?err=fields");
  const slug = await uniqueListingSlug(slugify(name));
  const last = await prisma.listing.aggregate({ _max: { number: true } });
  const number = (last._max.number || 0) + 1;
  const ownerPath = githubOwnerFromUrl(officialUrl);
  const claimed = Boolean(
    ownerPath && me.githubHandle && ownerPath === me.githubHandle.toLowerCase()
  );
  await prisma.listing.create({
    data: {
      number,
      slug,
      name,
      officialUrl,
      oneLiner,
      body: oneLiner,
      tags,
      ownerId: claimed ? me.id : me.id,
      claimed,
      offersMeetings: me.takesMeetings,
    },
  });
  revalidatePath("/find");
  redirect(`/l/${slug}`);
}

async function uniqueListingSlug(base: string) {
  let slug = base || "tool";
  let n = 0;
  while (await prisma.listing.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function claimListing(listingId: string) {
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
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) redirect("/find");
  await prisma.take.upsert({
    where: { listingId_userId: { listingId, userId: me.id } },
    update: { optedIn: me.optInBuilders },
    create: {
      listingId,
      userId: me.id,
      optedIn: me.optInBuilders,
    },
  });
  revalidatePath(`/l/${listing.slug}`);
  revalidatePath("/you");
  redirect(`/out/${listing.slug}`);
}

export async function bookMeeting(formData: FormData) {
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const toUserId = String(formData.get("toUserId") || "");
  const listingId = String(formData.get("listingId") || "") || null;
  const kind = String(formData.get("kind") || "buy");
  const note = String(formData.get("note") || "").trim() || null;
  if (!toUserId || toUserId === me.id) redirect("/you");
  await prisma.meetingRequest.create({
    data: {
      fromUserId: me.id,
      toUserId,
      listingId,
      kind: kind === "sell" ? "sell" : "buy",
      note,
    },
  });
  revalidatePath("/you");
  redirect("/you?ok=meet");
}

export async function leaveTip(formData: FormData) {
  const me = await getSessionUser();
  const amount = String(formData.get("amount") || "").trim();
  const email = String(formData.get("email") || me?.email || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  if (!amount) redirect("/tip?err=amount");
  await prisma.tip.create({
    data: {
      userId: me?.id,
      email,
      amount,
      note,
    },
  });
  redirect("/tip?ok=1");
}
