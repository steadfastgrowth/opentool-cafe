import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="max-w-xl mx-auto px-5 py-12 space-y-4 text-sm leading-relaxed">
      <h1 className="display text-4xl mb-4">House rules</h1>
      <p>This is a community board, not legal advice, not a bank, not a job agency.</p>
      <p>List only tools you may share. Official URLs should be the real project. Claimed GitHub listings have to match the signed-in GitHub handle.</p>
      <p>No malware, no stolen accounts, no scraping the house list. The desk can remove a listing or a profile.</p>
      <p>Tips are voluntary. Cards bill as STEADFAST GROWTH. No cash prizes.</p>
      <p>
        Software in the GitHub repo is MIT. The live cafe, names, and menu are not a license to impersonate the
        host. See <Link href="/privacy">privacy</Link>.
      </p>
    </main>
  );
}
