export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <a className="btn btn-ghost w-full no-underline" href="/auth/github">
        GitHub
      </a>
      <p className="font-mono text-[11px] text-dim">GitHub login. Needed to claim a repo.</p>
    </div>
  );
}
