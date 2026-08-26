import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#f4e6c8",
          color: "#2a160c",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#d35400" }}>OPEN TOOL CAFE</div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, marginTop: 16 }}>@{slug}</div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 20, color: "#4a3224" }}>Builder at the cafe.</div>
      </div>
    ),
    { ...size },
  );
}
