import { getSessionUser } from "@/lib/auth";
import { listRepo } from "@/app/actions";
import { JoinForm } from "@/components/join-form";

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const me = await getSessionUser();
  const q = await searchParams;
  return (
    <main className="max-w-3xl mx-auto px-5 py-10">
      <p className="display text-sm tracking-[0.2em] uppercase text-mute mb-2">Back of house</p>
      <h1 className="display text-4xl mb-3">Makers</h1>
      <p className="mb-8 max-w-xl">
        Put a repo on the board. People who take it show up on the tab. Listing is free.
      </p>
      {!me ? (
        <div className="ticket p-6 max-w-md">
          <JoinForm />
        </div>
      ) : (
        <form action={listRepo} className="ticket p-6 space-y-3 max-w-lg">
          {q.err === "fields" && (
            <p className="text-sm" style={{ color: "var(--bad)" }}>
              Name, URL, and one sentence.
            </p>
          )}
          <div>
            <label className="lbl">tool name</label>
            <input name="name" className="field" required />
          </div>
          <div>
            <label className="lbl">repo or Hugging Face URL</label>
            <input name="url" className="field" required />
          </div>
          <div>
            <label className="lbl">one sentence</label>
            <input name="oneLiner" className="field" required />
          </div>
          <div>
            <label className="lbl">tags</label>
            <input name="tags" className="field" placeholder="local-ai, self-hosted" />
          </div>
          <button className="btn" type="submit">
            List this repo
          </button>
        </form>
      )}
    </main>
  );
}
