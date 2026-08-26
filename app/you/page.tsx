import { Link } from "@/components/link";
import { redirect } from "next/navigation";
import { getSessionUser, padTicket } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { logout, saveProfile, uploadAvatar, setPassword } from "@/app/actions";
import { Avatar } from "@/components/avatar";

export default async function YouPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const prisma = await getPrisma();
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const q = await searchParams;
  const takes = await prisma.take.findMany({
    where: { userId: me.id },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });
  const listed = await prisma.listing.findMany({
    where: { ownerId: me.id },
    orderBy: { number: "asc" },
  });
  const inbox = await prisma.take.findMany({
    where: { listing: { ownerId: me.id }, optedIn: true },
    include: { user: true, listing: true },
    orderBy: { createdAt: "desc" },
  });
  const meetingsIn = await prisma.meetingRequest.findMany({
    where: { toUserId: me.id },
    include: { fromUser: true, listing: true },
    orderBy: { createdAt: "desc" },
  });
  const meetingsOut = await prisma.meetingRequest.findMany({
    where: { fromUserId: me.id },
    include: { toUser: true, listing: true },
    orderBy: { createdAt: "desc" },
  });
  const posts = await prisma.post.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-5 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex gap-4 items-start">
          <Avatar name={me.name || me.slug} src={me.avatarUrl} size={112} />
          <div>
            <h1 className="display text-4xl">{me.name || me.slug}</h1>
            <p className="font-mono text-dim mt-1">@{me.slug}</p>
            <p className="font-mono text-[11px] text-mark mt-2">
              Door: {me.githubId ? "GitHub" : me.passwordHash ? "email + password" : "email code"}
            </p>
            <p className="mt-3 flex flex-wrap gap-2">
              <Link href={`/u/${me.slug}`} className="btn sm:w-auto no-underline">
                View public profile
              </Link>
            </p>
          </div>
        </div>
        <form action={logout} className="sm:shrink-0">
          <button className="btn btn-ghost sm:w-auto" type="submit">
            Log out
          </button>
        </form>
      </div>
      {q.ok === "meet" && <p>Meeting request stored.</p>}
      {q.ok === "password" && <p>Password saved.</p>}
      {q.err === "password" && <p>Password needs at least 8 characters.</p>}
      {q.err === "photo" && <p>Photo needs to be a jpg/png/webp under 3MB. Uploads may not persist on this host yet.</p>}

      <section className="ticket p-6">
        <h2 className="display text-xl mb-4">Photo</h2>
        <p className="text-sm text-dim mb-4">Optional. Initials show until you add one.</p>
        <form action={uploadAvatar} className="space-y-3">
          <label className="lbl" htmlFor="you-photo">
            photo
          </label>
          <input id="you-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="field" />
          <button className="btn sm:w-auto" type="submit">
            Upload photo
          </button>
        </form>
      </section>

      <section className="ticket p-6">
        <h2 className="display text-xl mb-4">Password</h2>
        <p className="text-sm text-dim mb-4">Set one after GitHub or a login code.</p>
        <form action={setPassword} className="space-y-3">
          <label className="lbl" htmlFor="you-password">
            new password
          </label>
          <input id="you-password" name="password" type="password" className="field" minLength={8} autoComplete="new-password" />
          <button className="btn sm:w-auto" type="submit">
            Save password
          </button>
        </form>
      </section>

      <section className="ticket p-6">
        <h2 className="display text-xl mb-4">Profile</h2>
        <form action={saveProfile} className="grid gap-3">
          <div>
            <label className="lbl" htmlFor="you-name">
              name
            </label>
            <input id="you-name" name="name" className="field" defaultValue={me.name || ""} autoComplete="name" />
          </div>
          <div>
            <label className="lbl" htmlFor="you-slug">
              slug
            </label>
            <input id="you-slug" name="slug" className="field" defaultValue={me.slug} />
          </div>
          <div>
            <label className="lbl" htmlFor="you-bio">
              one line
            </label>
            <input id="you-bio" name="bio" className="field" defaultValue={me.bio || ""} />
          </div>
          <div>
            <label className="lbl" htmlFor="you-offering">
              I can help with
            </label>
            <input
              id="you-offering"
              name="offering"
              className="field"
              defaultValue={me.offering || ""}
              placeholder="Next.js, tax appeals, landing pages"
            />
          </div>
          <div>
            <label className="lbl" htmlFor="you-looking">
              looking for
            </label>
            <input
              id="you-looking"
              name="lookingFor"
              className="field"
              defaultValue={me.lookingFor || ""}
              placeholder="a designer, a cofounder, weekend help"
            />
          </div>
          <div>
            <label className="lbl" htmlFor="you-skills">
              skills
            </label>
            <input id="you-skills" name="skills" className="field" defaultValue={me.skills || ""} placeholder="rust, prisma, copy" />
          </div>
          <div>
            <label className="lbl" htmlFor="you-phone">
              phone
            </label>
            <input id="you-phone" name="phone" className="field" defaultValue={me.phone || ""} autoComplete="tel" />
          </div>
          <div>
            <label className="lbl" htmlFor="you-github">
              github
            </label>
            <input id="you-github" name="github" className="field" defaultValue={me.github || ""} placeholder="https://github.com/you" />
          </div>
          <div>
            <label className="lbl" htmlFor="you-x">
              x
            </label>
            <input id="you-x" name="x" className="field" defaultValue={me.x || ""} />
          </div>
          <div>
            <label className="lbl" htmlFor="you-hf">
              hugging face
            </label>
            <input id="you-hf" name="huggingface" className="field" defaultValue={me.huggingface || ""} />
          </div>
          <div>
            <label className="lbl" htmlFor="you-li">
              linkedin
            </label>
            <input id="you-li" name="linkedin" className="field" defaultValue={me.linkedin || ""} />
          </div>
          <div>
            <label className="lbl" htmlFor="you-site">
              site
            </label>
            <input id="you-site" name="website" className="field" defaultValue={me.website || ""} />
          </div>
          <div>
            <label className="lbl" htmlFor="you-cal">
              calendar
            </label>
            <input id="you-cal" name="calendarUrl" className="field" defaultValue={me.calendarUrl || ""} />
          </div>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" name="takesMeetings" defaultChecked={me.takesMeetings} />
            Take meetings
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="optIn" defaultChecked={me.optInBuilders} className="mt-1" />
            <span>
              Opt in to receiving emails, messages, and/or calls from the
              builders of the tools you download.
            </span>
          </label>
          <button className="btn w-fit" type="submit">
            Save
          </button>
        </form>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="display text-2xl">Board posts</h2>
          <Link href="/board/new" className="nav-link">
            New pin →
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-dim">None yet.</p>
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/board/${p.id}`}>
                  {p.kind} · {p.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="display text-2xl mb-3">Taken</h2>
        {takes.length === 0 ? (
          <p className="text-dim">
            None yet. <Link href="/find">Menu</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {takes.map((t) => (
              <li key={t.id}>
                <Link href={`/l/${t.listing.slug}`}>
                  #{padTicket(t.listing.number)} {t.listing.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="display text-2xl mb-3">Listed</h2>
        {listed.length === 0 ? (
          <p className="text-dim">
            None. <Link href="/list">List a repo</Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {listed.map((l) => (
              <li key={l.id}>
                <Link href={`/l/${l.slug}`}>
                  #{padTicket(l.number)} {l.name}
                </Link>
                {l.claimed ? " · claimed" : " · unclaimed"}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="display text-2xl mb-3">People who took a tool</h2>
        <p className="text-sm text-dim mb-3">
          Email shows only with opt-in, for that listing. They can turn it off on /you.
        </p>
        {inbox.length === 0 ? (
          <p className="text-dim">Empty.</p>
        ) : (
          <ul className="space-y-2">
            {inbox.map((row) => (
              <li key={row.id} className="ticket p-3">
                <Link href={`/u/${row.user.slug}`}>{row.user.name || row.user.slug}</Link>
                {" · "}
                {row.listing.name}
                {row.user.email && row.optedIn ? ` · ${row.user.email}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="display text-2xl mb-3">Meetings</h2>
        <ul className="space-y-2">
          {meetingsIn.map((m) => (
            <li key={m.id} className="ticket p-3">
              In · {m.fromUser.name || m.fromUser.slug} · {m.kind} · {m.listing?.name || "profile"} · {m.status}
            </li>
          ))}
          {meetingsOut.map((m) => (
            <li key={m.id} className="ticket p-3">
              Out · {m.toUser.name || m.toUser.slug} · {m.kind} · {m.status}
            </li>
          ))}
          {meetingsIn.length + meetingsOut.length === 0 && <li className="text-dim">None.</li>}
        </ul>
      </section>

      <p>
        <Link href="/tip" className="nav-link">
          Tip the cafe
        </Link>
      </p>
    </main>
  );
}
