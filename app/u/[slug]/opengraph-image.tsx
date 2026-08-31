import { ImageResponse } from "next/og";
import { getPrisma } from "@/lib/db";
import { padMember } from "@/lib/founding";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prisma = await getPrisma();
  const person = await prisma.user.findUnique({
    where: { slug },
    select: { founding: true, memberNumber: true },
  });
  const n = person?.memberNumber as number | null | undefined;
  const badge = person?.founding
    ? n != null
      ? `#${padMember(n)}`
      : ""
    : null;
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
        <div style={{ display: "flex", alignItems: "center", fontSize: 68, fontWeight: 700, marginTop: 16 }}>
          @{slug}
          {person?.founding ? (
            <span
              style={{
                display: "flex",
                marginLeft: 20,
                minWidth: 120,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                background: "#f0b429",
                border: "4px solid #2a160c",
                color: "#2a160c",
              }}
            >
              {badge || " "}
            </span>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 20, color: "#4a3224" }}>
          {person?.founding ? (n != null ? `Regular #${padMember(n)}.` : "House.") : "Builder at the cafe."}
        </div>
      </div>
    ),
    { ...size },
  );
}
