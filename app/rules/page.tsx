import { Link } from "@/components/link";
import { Stage } from "@/components/stage";

export default function RulesPage() {
  return (
    <Stage label="House rules" wide={false}>
      <h1 className="display text-4xl mb-3">House rules</h1>
      <p className="text-dim mb-8">This is a cafe for builders. Keep it that way.</p>

      <h2 className="display text-2xl mb-2">The point</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Open Tool Cafe is for sharing and downloading open source tools, and for talking with other founders and
        builders. The menu is tools. The board is posts. If it does not belong in a workshop, it does not belong
        here.
      </p>

      <h2 className="display text-2xl mb-2">Not allowed</h2>
      <ul className="text-dim mb-6 space-y-2 leading-relaxed list-disc pl-5">
        <li>Sexual content of any kind, including porn, fetish, or sexualized imagery or writing.</li>
        <li>Sexual exploitation, grooming, or anything involving minors. Zero tolerance. We report illegal material.</li>
        <li>Harassment, hate, threats, doxxing, or brigading.</li>
        <li>Malware, credential theft, or tools whose primary use is harming people who did not ask for it.</li>
        <li>Spam, scams, impersonation, or fake tools.</li>
        <li>Anything illegal under US law.</li>
      </ul>

      <h2 className="display text-2xl mb-2">We can take it down</h2>
      <p className="text-dim mb-6 leading-relaxed">
        We reserve the right to remove any account, post, listing, comment, or other content that, in our judgment,
        goes against the ethics, morals, or purpose of this cafe — including the rules above and anything else that
        makes this a worse place for builders. We do not have to debate it with you first. Repeat or severe abuse
        gets a ban.
      </p>

      <h2 className="display text-2xl mb-2">How to flag it</h2>
      <p className="text-dim mb-6 leading-relaxed">
        Use the <Link href="/help">help</Link> page or a note on <Link href="/tip">tip</Link>. If you see exploitation
        of minors, tell us immediately and contact the appropriate authorities.
      </p>

      <p className="font-mono text-[12px] text-dim">Effective 26 Aug 2026. We can update these rules.</p>
    </Stage>
  );
}
