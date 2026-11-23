# Nexus Öğrenci Kulübü – Web Sitesi

Karabük Üniversitesi **Nexus** öğrenci kulübünün tanıtım sitesi. Bölümler arası bağ kuran kulübü tanıtır, ekibi gösterir, etkinlikleri listeler ve üyelik başvurusu alır.

## Teknolojiler

- **Next.js 16** (App Router, Cache Components) + **React 19** + **TypeScript**
- **Tailwind CSS v4** ile özel tasarım sistemi (`src/app/globals.css`)
- **react-hook-form + zod**: istemci ve sunucu tarafında aynı şemayla doğrulanan başvuru formu
- **lucide-react** ikonları, `next/font` ile Inter + Space Grotesk
- SEO: `metadata`, Open Graph, `sitemap.xml`, `robots.txt`
- Erişilebilirlik: klavye odak halkaları, "içeriğe atla" bağlantısı, `aria-*` etiketleri, `prefers-reduced-motion` desteği

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

## İçeriği güncelleme (kod bilgisi gerekmez)

| Ne | Dosya |
| --- | --- |
| Kulüp adı, açıklama, e-posta, sosyal medya, istatistikler | `src/content/site.ts` |
| Ekip üyeleri (isim, görev, bölüm, fotoğraf) | `src/content/team.ts` – fotoğraflar `public/team/` |
| Etkinlikler (yaklaşan / geçmiş) | `src/content/events.ts` – görseller `public/events/` |
| Sıkça sorulan sorular | `src/content/faq.ts` |
| Form alanları ve ilgi alanları | `src/lib/schema.ts` |

## Başvuruların toplanması

Form `POST /api/basvuru` ucuna gider. `.env.local` dosyasında `APPLICATION_WEBHOOK_URL` tanımlıysa başvuru JSON olarak oraya iletilir; tanımlı değilse sunucu günlüğüne yazılır.

En kolay yol **Google Sheets**: bir Google Apps Script web uygulaması oluşturup `doPost` içinde gelen JSON'u tabloya ekleyin, yayınlanan URL'yi `APPLICATION_WEBHOOK_URL` olarak girin. Discord/Slack webhook'u veya Make/Zapier da kullanılabilir.

## Yayına alma

Vercel'e GitHub deposunu bağlamanız yeterli; ek ayar gerekmez. Yayına aldıktan sonra `src/content/site.ts` içindeki `url` alanını gerçek adresle güncelleyin.

## Yapı

```
src/
  app/            sayfalar (/, /hakkimizda, /etkinlikler, /ekip, /basvuru, /iletisim) ve API ucu
  components/     yeniden kullanılabilir bileşenler (Navbar, Hero, EventCard, ApplicationForm ...)
  content/        tüm metin ve veri içeriği
  lib/            zod şeması ve yardımcılar
```
