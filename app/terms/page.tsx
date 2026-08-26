import { Link } from "@/components/link";
import { Stage } from "@/components/stage";

export default function TermsPage() {
  return (
    <Stage label="Terms" wide={false}>
      <h1 className="display text-4xl mb-3">Terms of service</h1>
      <p className="text-dim mb-8">
        By using opentool.cafe you agree to these terms and the <Link href="/rules">house rules</Link>. If you do
        not agree, leave.
      </p>

      <h2 className="display text-2xl mb-2">The cafe</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Open Tool Cafe is a directory and hangout for open source tools and the people who make and use them. We
        provide the site as-is. Tools on the menu are third-party software. You download and run them at your own
        risk. Official URLs should be the real project. Claimed GitHub listings have to match the signed-in GitHub
        handle.
      </p>

      <h2 className="display text-2xl mb-2">Your account</h2>
      <p className="text-dim mb-6 leading-relaxed">
        You are responsible for what you post, list, and link. Do not share your password. GitHub login is between
        you and GitHub.
      </p>

      <h2 className="display text-2xl mb-2">Your content</h2>
      <p className="text-dim mb-6 leading-relaxed">
        You keep ownership of what you post. You give us a license to host, display, and distribute it on the cafe so
        the site can work. You promise you have the right to share it, and that it follows the house rules.
      </p>

      <h2 className="display text-2xl mb-2">Moderation</h2>
      <p className="text-dim mb-6 leading-relaxed">
        We reserve the right to refuse service, remove content, suspend accounts, or shut down features at any time,
        for any reason we believe serves the ethics, morals, or purpose of the cafe — especially sexual content,
        sexual exploitation, and anything involving minors. We may preserve records when the law requires it.
      </p>

      <h2 className="display text-2xl mb-2">Tips</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Tips are voluntary. Cards bill as STEADFAST GROWTH. No cash prizes.
      </p>

      <h2 className="display text-2xl mb-2">Liability</h2>
      <p className="text-dim mb-6 leading-relaxed">
        The cafe is provided without warranties. To the fullest extent the law allows, we are not liable for lost
        data, broken tools, or fights in the comments. If a court says otherwise, our total liability is what you
        paid us in the last 12 months (often zero).
      </p>

      <h2 className="display text-2xl mb-2">Changes</h2>
      <p className="text-dim mb-6 leading-relaxed">
        We can change these terms. Continued use after a change means you accept the new ones. Software in the
        GitHub repo is MIT. The live cafe, names, and menu are not a license to impersonate the host. These terms
        are a starting draft, not a substitute for a lawyer.
      </p>

      <p className="font-mono text-[12px] text-dim">Effective 26 Aug 2026.</p>
    </Stage>
  );
}
