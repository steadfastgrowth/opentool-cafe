import { loginWithPassword, requestMagicLink } from "@/app/actions";

export function LoginForm() {
  return (
    <div className="space-y-8">
      <form action={loginWithPassword} className="space-y-4">
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
            required
            className="field"
            autoComplete="current-password"
            minLength={8}
          />
        </div>
        <button className="btn" type="submit">
          Sign in
        </button>
      </form>

      <form action={requestMagicLink} className="space-y-4">
        <p className="font-mono text-[11px] tracking-widest uppercase text-dim">or email a code</p>
        <div>
          <label className="lbl" htmlFor="code-email">
            email
          </label>
          <input id="code-email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        <button className="btn btn-ghost" type="submit">
          Email me a 6-digit code
        </button>
      </form>
    </div>
  );
}
