"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#f4e6c8", color: "#2a160c", fontFamily: "IBM Plex Sans, sans-serif", padding: "4rem 1.25rem" }}>
        <main style={{ maxWidth: 36 + "rem", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "Chakra Petch, sans-serif", fontSize: "2.2rem" }}>Kitchen hitch</h1>
          <p style={{ margin: "1rem 0 1.5rem" }}>opentool.cafe did not load. Try again.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ background: "#d35400", color: "#fff8ea", border: 0, padding: "0.7rem 1.1rem", font: "inherit" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
