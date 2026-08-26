import { loginWithPassword, registerWithPassword, requestMagicLink } from "@/app/actions";

const OPTIN =
  "Opt in to receiving emails, messages, and/or calls from the builders of the tools you download.";

export function JoinForm({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-8">
      <form className="space-y-4">
        <div>
          <label className="lbl" htmlFor="email">
            email
          </label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        <div>
          <label className="lbl" htmlFor="password">
            password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="field"
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-dim">
          <input type="checkbox" name="optIn" className="mt-1" />
          <span>{OPTIN}</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn" type="submit" formAction={registerWithPassword}>
            {compact ? "Create account" : "Create account"}
          </button>
          <button className="btn btn-ghost" type="submit" formAction={loginWithPassword}>
            Sign in
          </button>
        </div>
      </form>

      <form action={requestMagicLink} className="space-y-4">
        <p className="font-mono text-[11px] tracking-widest uppercase text-dim">or email a code</p>
        <div>
          <label className="lbl" htmlFor="code-email">
            email
          </label>
          <input id="code-email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        <label className="flex items-start gap-2 text-sm text-dim">
          <input type="checkbox" name="optIn" className="mt-1" />
          <span>{OPTIN}</span>
        </label>
        <button className="btn btn-ghost" type="submit">
          Email me a 6-digit code
        </button>
      </form>
    </div>
  );
}
