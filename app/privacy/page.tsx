import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-12 space-y-4 text-sm leading-relaxed">
      <h1 className="display text-4xl mb-4">Privacy</h1>
      <p>Open Tool Cafe is a public directory of tools and people. Run your own copy if this host is not a fit.</p>
      <p>
        An account stores email, an optional password hash, optional phone, profile text, and links you type.
        Phone is not shown on the public profile. Email is shown to a builder only when a tool is taken and the
        opt-in box is on. That builder is the person who claimed that listing.
      </p>
      <p>
        The opt-in box means: emails, messages, and/or calls from the builders of the tools you download. Turn
        it off anytime on <Link href="/you">/you</Link>.
      </p>
      <p>
        A session cookie (<span className="font-mono">opentool_sid</span>) keeps you signed in. First-party
        event counts (page views, takes, outbound clicks) stay on this host. Referrer is stored, truncated.
      </p>
      <p>
        Tips go through Stripe on the existing Steadfast Growth merchant. Card data never touches this server.
        Statement line: STEADFAST GROWTH.
      </p>
      <p>No sale of contact lists in this slice. Delete a profile by emailing the operator listed on GitHub.</p>
    </main>
  );
}
