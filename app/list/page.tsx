import { getSessionUser } from "@/lib/auth";
import { listRepo } from "@/app/actions";
import { Stage } from "@/components/stage";
import Link from "next/link";

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const me = await getSessionUser();
  const q = await searchParams;
  return (
    <Stage label="List a tool" wide={false}>
      <h1 className="display text-4xl mb-3">List a tool</h1>
      <p className="mb-8 max-w-xl text-dim">Put a repo on the menu. Listing is free.</p>
      {!me ? (
        <div className="flex flex-col sm:flex-row gap-3 max-w-md">
          <Link href="/join" className="btn no-underline sm:w-auto">
            Join
          </Link>
          <Link href="/login" className="btn btn-ghost no-underline sm:w-auto">
            Login
          </Link>
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
    </Stage>
  );
}
