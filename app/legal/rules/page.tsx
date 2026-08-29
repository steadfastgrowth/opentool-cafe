import { Link } from "@/components/link";
import { Stage } from "@/components/stage";

export default function RulesPage() {
  return (
    <Stage label="House rules" wide={false}>
      <h1 className="display text-4xl mb-3">House rules</h1>
      <p className="text-dim mb-8">A cafe for sharing open source tools and talking with other builders.</p>

      <h2 className="display text-2xl mb-2">Not allowed</h2>
      <ul className="text-dim mb-6 space-y-2 leading-relaxed list-disc pl-5">
        <li>Sexual content of any kind.</li>
        <li>Sexual exploitation, grooming, or anything involving minors. We report illegal material.</li>
        <li>Harassment, hate, threats, or doxxing.</li>
        <li>Malware, credential theft, or tools meant to harm people who did not ask.</li>
        <li>Spam, scams, impersonation, or fake tools.</li>
        <li>Anything illegal under US law.</li>
      </ul>

      <h2 className="display text-2xl mb-2">We can take it down</h2>
      <p className="text-dim mb-6 leading-relaxed">
        We can remove posts, listings, comments, or accounts that break these rules or wreck the cafe. Repeat or
        severe abuse gets a ban.
      </p>

      <h2 className="display text-2xl mb-2">How to flag it</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Use the <Link href="/help">help</Link> page. If you see exploitation of minors, tell us immediately and
        contact the authorities.
      </p>

      <p className="font-mono text-[12px] text-dim">Effective 28 Aug 2026. We can update these rules.</p>
    </Stage>
  );
}
