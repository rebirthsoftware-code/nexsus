import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} | ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Sosyal medyada link paylaşıldığında görünen kapak görseli (derleme anında üretilir). */
export default async function OpengraphImage() {
  const font = await readFile(join(process.cwd(), "src/assets/BricolageGrotesque-ExtraBold.ttf"));
  const ink = "#14110f";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f3eee3", color: ink, fontFamily: "Bricolage", padding: 64, justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 2, border: `4px solid ${ink}`, borderRadius: 999, padding: "10px 24px", alignSelf: "flex-start" }}>
            {site.university.toLocaleUpperCase("tr-TR")} · ÖĞRENCİ KULÜBÜ
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 124, lineHeight: 1, letterSpacing: -6 }}>
            <div style={{ display: "flex" }}>Kampüsün</div>
            <div style={{ display: "flex", alignSelf: "flex-start", background: "#c8f03c", border: `5px solid ${ink}`, borderRadius: 24, padding: "0 22px 12px", margin: "6px 0" }}>bağlantı</div>
            <div style={{ display: "flex" }}>noktası.</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", width: 330, height: 330, borderRadius: 999, background: "#2d3fe7", border: `6px solid ${ink}`, boxShadow: `12px 12px 0 ${ink}`, alignItems: "center", justifyContent: "center", color: "#f3eee3", fontSize: 76, letterSpacing: -3 }}>
            NEXUS
          </div>
          <div style={{ display: "flex", fontSize: 30 }}>{site.instagramHandle}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Bricolage", data: font, weight: 800, style: "normal" }] }
  );
}
