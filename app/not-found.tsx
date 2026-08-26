import Link from "next/link";

export default function NotFound() {
  return (
    <div className="library" style={{ display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <h1 className="library-wordmark">No guide here</h1>
        <p className="library-tagline" style={{ margin: "14px 0 24px" }}>
          That game isn&apos;t in the library yet.
        </p>
        <Link href="/" className="guide-back">
          ← Back to the library
        </Link>
      </div>
    </div>
  );
}
