export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <a className="btn btn-ghost w-full no-underline" href="/auth/github">
        Continue with GitHub
      </a>
      <p className="font-mono text-[11px] text-dim">GitHub is for builders who want to claim a repo.</p>
    </div>
  );
}
