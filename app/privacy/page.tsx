import { Link } from "@/components/link";
import { Stage } from "@/components/stage";

export default function PrivacyPage() {
  return (
    <Stage label="Privacy" wide={false}>
      <h1 className="display text-4xl mb-3">Privacy</h1>
      <p className="text-dim mb-8">
        We run a small cafe. We do not sell your data. We do not run Google Analytics.
      </p>

      <h2 className="display text-2xl mb-2">What we keep</h2>
      <ul className="text-dim mb-6 space-y-2 leading-relaxed list-disc pl-5">
        <li>Account: email, name, slug, profile fields you type, GitHub handle if you connect GitHub.</li>
        <li>Passwords: never stored as passwords. We keep a salted PBKDF2 hash only.</li>
        <li>
          Session cookie (<span className="font-mono">opentool_sid</span>), httpOnly, so you stay logged in.
        </li>
        <li>
          First-party metrics: page path, time, anonymous visitor id in your browser, and external referrer. No
          advertising profile.
        </li>
        <li>
          Optional opt-in so builders of tools you take can email, message, or call. Off anytime on{" "}
          <Link href="/you">/you</Link>. Phone is not on the public profile.
        </li>
        <li>
          Tips go through Stripe on the Steadfast Growth merchant. Card data never touches this server. Statement
          line: STEADFAST GROWTH.
        </li>
      </ul>

      <h2 className="display text-2xl mb-2">Who sees it</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Public profile, posts, and listed tools are public. Hosting is on Cloudflare (Workers + D1). Email login
        codes go through our mail provider. GitHub sees the OAuth dance if you use GitHub. We do not sell lists.
      </p>

      <h2 className="display text-2xl mb-2">How long</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Account data lasts while the account exists. Ask via <Link href="/help">help</Link> to delete. We may keep
        what the law or safety requires.
      </p>

      <h2 className="display text-2xl mb-2">Kids</h2>
      <p className="text-dim mb-6 leading-relaxed">
        We do not knowingly collect personal data from children under 13. Sexual content and any exploitation of
        minors is banned; see the <Link href="/rules">house rules</Link>.
      </p>

      <p className="font-mono text-[12px] text-dim">Effective 26 Aug 2026. We can update this page.</p>
    </Stage>
  );
}
