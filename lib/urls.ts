const HOSTS = new Set([
  "github.com",
  "www.github.com",
  "gitlab.com",
  "www.gitlab.com",
  "huggingface.co",
  "www.huggingface.co",
  "codeberg.org",
  "sr.ht",
  "git.sr.ht",
  "npmjs.com",
  "www.npmjs.com",
  "pypi.org",
  "crates.io",
]);

export function parseHttpUrl(raw: string) {
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

export function hostAllowed(raw: string) {
  const u = parseHttpUrl(raw);
  if (!u) return false;
  const host = u.hostname.toLowerCase();
  if (HOSTS.has(host)) return true;
  if (host.endsWith(".github.io")) return true;
  if (host.endsWith(".gitlab.io")) return true;
  return false;
}
