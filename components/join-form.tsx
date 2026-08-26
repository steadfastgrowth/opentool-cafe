import { requestMagicLink } from "@/app/actions";

export function JoinForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action={requestMagicLink} className="space-y-3">
      <div>
        <label className="lbl" htmlFor="email">
          email
        </label>
        <input id="email" name="email" type="email" required className="field" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="optIn" />
        Email from builders
      </label>
      <button className="btn" type="submit">
        {compact ? "Join" : "Get on the house list"}
      </button>
    </form>
  );
}
