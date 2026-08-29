import { Link } from "@/components/link";
import { Stage } from "@/components/stage";

export default function PrivacyPage() {
  return (
    <Stage label="Privacy" wide={false}>
      <h1 className="display text-4xl mb-3">Privacy</h1>
      <p className="text-dim mb-8">What we keep, and who sees it.</p>

      <h2 className="display text-2xl mb-2">Account</h2>
      <ul className="text-dim mb-6 space-y-2 leading-relaxed list-disc pl-5">
        <li>Email, name, slug, profile fields you type, and GitHub if you connect it.</li>
        <li>Passwords stored hashed, not in the clear.</li>
        <li>
          A session cookie (<span className="font-mono">opentool_sid</span>) so you stay logged in.
        </li>
        <li>
          Optional opt-in so builders of tools you download can email, message, or call. Off anytime on{" "}
          <Link href="/you">/you</Link>. Phone is not on the public profile.
        </li>
        <li>Tips go through Stripe (Steadfast Growth). Card numbers do not land on this server.</li>
      </ul>

      <h2 className="display text-2xl mb-2">What&apos;s public</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Profiles, posts, and listed tools are public. Hosting is Cloudflare. Login emails go through our mail
        provider. GitHub sees the login if you use GitHub.
      </p>

      <h2 className="display text-2xl mb-2">How long</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Account data lasts while the account exists. Ask via <Link href="/help">help</Link> to delete. We may keep
        what the law requires.
      </p>

      <p className="font-mono text-[12px] text-dim">Effective 28 Aug 2026. We can update this page.</p>
    </Stage>
  );
}
