import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} | ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Sosyal medyada link paylaşıldığında görünen kapak görseli. */
export default async function OpengraphImage() {
  const [font, logo] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/BricolageGrotesque-ExtraBold.ttf")),
    readFile(join(process.cwd(), "public/brand/nexus-logo.png")),
  ]);
  const ink = "#0b0b0c";
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f5f2ea", color: ink, fontFamily: "Bricolage", padding: 64, borderBottom: "28px solid #015efb" }}>
        <img src={logoSrc} alt="" width={760} height={231} />
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", fontSize: 84, lineHeight: 1.05, letterSpacing: -4, maxWidth: 820 }}>
            <span style={{ marginRight: 20 }}>Kampüsün</span>
            <span style={{ background: "#015efb", color: "#f5f2ea", border: `5px solid ${ink}`, borderRadius: 20, padding: "0 20px 8px", marginRight: 20 }}>bağlantı</span>
            <span>noktası.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#011e45" }}>{site.instagramHandle}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: font, weight: 800, style: "normal" }] }
  );
}
