import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Wit cameraatje op het warme oranje/roze verloop.
const camera = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 64 64">
  <rect x="20" y="12" width="18" height="9" rx="3" fill="#ffffff" opacity="0.8"/>
  <rect x="5" y="18" width="54" height="36" rx="11" fill="#ffffff"/>
  <circle cx="32" cy="37" r="13" fill="#f4476a"/>
  <circle cx="32" cy="37" r="9" fill="#ffffff"/>
  <circle cx="32" cy="37" r="4.5" fill="#f4476a"/>
  <circle cx="49" cy="26" r="2.6" fill="#fb923c"/>
</svg>`;

export default function AppleIcon() {
  const src = `data:image/svg+xml;base64,${Buffer.from(camera).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #fb923c, #f43f6e)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={120} height={120} alt="" />
      </div>
    ),
    { ...size }
  );
}
