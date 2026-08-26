"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <h1 className="display text-4xl mb-3">Kitchen hitch</h1>
      <p className="text-dim mb-6">Page did not load. Try again.</p>
      <button className="btn sm:w-auto" type="button" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
