import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div style={{ display: "flex", fontSize: 58, fontWeight: 700, marginTop: 18 }}>
          Welcome to open tool cafe,
        </div>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 700 }}>can I take your order?</div>
        <div style={{ display: "flex", fontSize: 26, marginTop: 28, color: "#4a3224" }}>
          Share tools. Meet builders. Enjoy some java.
        </div>
      </div>
    ),
    { ...size },
  );
}
