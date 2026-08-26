import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, padTicket } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout, saveProfile } from "@/app/actions";

export default async function YouPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
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

  return (
    <main className="max-w-3xl mx-auto px-5 py-10 space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="display text-4xl">{me.name || me.slug}</h1>
          <p className="text-sm text-mute">
            <Link href={`/u/${me.slug}`}>Public profile</Link>
          </p>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost" type="submit">
            Log out
          </button>
        </form>
      </div>
      {q.ok === "meet" && <p>Meeting request stored.</p>}

      <section className="ticket p-6">
        <h2 className="display text-xl mb-4">Profile</h2>
        <form action={saveProfile} className="grid gap-3">
          <div>
            <label className="lbl">name</label>
            <input name="name" className="field" defaultValue={me.name || ""} />
          </div>
          <div>
            <label className="lbl">slug</label>
            <input name="slug" className="field" defaultValue={me.slug} />
          </div>
          <div>
            <label className="lbl">one line</label>
            <input name="bio" className="field" defaultValue={me.bio || ""} />
          </div>
          <div>
            <label className="lbl">phone</label>
            <input name="phone" className="field" defaultValue={me.phone || ""} />
          </div>
          <div>
            <label className="lbl">github</label>
            <input name="github" className="field" defaultValue={me.github || ""} placeholder="https://github.com/you" />
          </div>
          <div>
            <label className="lbl">x</label>
            <input name="x" className="field" defaultValue={me.x || ""} />
          </div>
          <div>
            <label className="lbl">hugging face</label>
            <input name="huggingface" className="field" defaultValue={me.huggingface || ""} />
          </div>
          <div>
            <label className="lbl">linkedin</label>
            <input name="linkedin" className="field" defaultValue={me.linkedin || ""} />
          </div>
          <div>
            <label className="lbl">site</label>
            <input name="website" className="field" defaultValue={me.website || ""} />
          </div>
          <div>
            <label className="lbl">calendar</label>
            <input name="calendarUrl" className="field" defaultValue={me.calendarUrl || ""} />
          </div>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" name="takesMeetings" defaultChecked={me.takesMeetings} />
            Take meetings
          </label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" name="optIn" defaultChecked={me.optInBuilders} />
            Email from builders
          </label>
          <button className="btn w-fit" type="submit">
            Save
          </button>
        </form>
      </section>

      <section>
        <h2 className="display text-2xl mb-3">Taken</h2>
        {takes.length === 0 ? (
          <p className="text-mute">None yet. <Link href="/find">Board</Link></p>
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
          <p className="text-mute">
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
        {inbox.length === 0 ? (
          <p className="text-mute">Empty.</p>
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
          {meetingsIn.length + meetingsOut.length === 0 && <li className="text-mute">None.</li>}
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
