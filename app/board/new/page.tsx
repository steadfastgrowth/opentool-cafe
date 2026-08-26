import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createPost } from "@/app/actions";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const me = await getSessionUser();
  if (!me) redirect("/join");
  const q = await searchParams;
  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="display text-4xl mb-3">Pin a note</h1>
      <p className="text-dim mb-6">Help wanted, collab, service, or a bulletin.</p>
      {q.err === "fields" && <p className="mb-4">Need a title and a body.</p>}
      <form action={createPost} className="ticket p-5 space-y-3">
        <div>
          <label className="lbl">kind</label>
          <select name="kind" className="field">
            <option value="help">Need help</option>
            <option value="collab">Looking to collab</option>
            <option value="service">Offering a service</option>
            <option value="bulletin">Bulletin</option>
          </select>
        </div>
        <div>
          <label className="lbl">title</label>
          <input name="title" className="field" required />
        </div>
        <div>
          <label className="lbl">what&apos;s going on</label>
          <textarea name="body" className="field" rows={6} required />
        </div>
        <div>
          <label className="lbl">tags</label>
          <input name="tags" className="field" placeholder="nextjs, rust, design" />
        </div>
        <button className="btn" type="submit">
          Pin it
        </button>
      </form>
    </main>
  );
}
