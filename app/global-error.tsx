"use client";

/**
 * Last resort, when the root layout itself fails. It replaces the whole
 * document, so it brings its own html and body and plain inline styles.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F6F7FA", color: "#111318" }}>
        <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 16, textAlign: "center" }}>
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 24 }}>Scholars Drill could not load</h1>
            <p style={{ color: "#535A6B", lineHeight: 1.5 }}>
              Check your connection and try again. Work you started is saved on this device.
            </p>
            <button
              type="button"
              onClick={() => retry()}
              style={{ marginTop: 16, padding: "12px 20px", borderRadius: 999, border: 0, background: "#002EFF", color: "#FDFDFE", fontWeight: 600 }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
