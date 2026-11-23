# Nexus Öğrenci Kulübü – Web Sitesi

Karabük Üniversitesi **Nexus** öğrenci kulübünün tanıtım sitesi. Nexus "bağ" demek; site de bu fikir üzerine kurulu: farklı bölümleri birbirine bağlayan bir kulübü tanıtır, ekibi gösterir, etkinlikleri listeler ve üyelik başvurusu alır.

## Tasarım fikri

"Kampüs afişi": krem kağıt zemin, mürekkep siyahı kalın çizgiler, sert gölgeler ve her biri bir bölümü temsil eden canlı renkler. Öne çıkan parçalar:

- **Bağlantı haritası** (ana sayfa): Canvas ile çizilen etkileşimli ağ. Her etiket bir bölüm, ortadaki düğüm Nexus. İmleç "Sen" düğümüdür; yaklaştığı bölümlerle bağ kurar ve sayaç güncellenir.
- **Bilet görünümlü etkinlik kartları**: tarih koçanı, kategori rengi ve "X gün kaldı" sayacı. Tarihi geçen etkinlik kendiliğinden "geçmiş"e düşer.
- **Yaka kartı görünümlü ekip kartları**.
- **Canlı üye kartı** (başvuru sayfası): form doldurulurken kart anında güncellenir, gönderince üzerine "Başvuru alındı" damgası basılır.

Renkler ve yazı tipleri tek yerden yönetilir: `src/app/globals.css` içindeki `@theme` bloğu. Kulübün logosuna göre renkleri oradan değiştirebilirsiniz.

## Teknolojiler

- **Next.js 16** (App Router, Cache Components) + **React 19** + **TypeScript**
- **Tailwind CSS v4** ile özel tasarım sistemi
- **react-hook-form + zod**: istemci ve sunucuda aynı şemayla doğrulanan başvuru formu
- Canvas 2D ile yazılmış, kütüphanesiz etkileşimli animasyon
- `next/font` (Bricolage Grotesque, DM Sans, Instrument Serif, JetBrains Mono)
- SEO: `metadata`, otomatik üretilen Open Graph kapak görseli, `sitemap.xml`, `robots.txt`
- Erişilebilirlik: klavye odakları, "içeriğe atla" bağlantısı, `aria-*` etiketleri, `prefers-reduced-motion` desteği, JS kapalıyken de okunabilir içerik

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

## İçeriği güncelleme

Şu anki ekip isimleri, etkinlikler ve sayılar **örnek içeriktir**. Hepsi `src/content/` altında, kod bilgisi gerektirmeden değiştirilebilir:

| Ne | Dosya |
| --- | --- |
| Kulüp adı, açıklama, e-posta, sosyal medya, istatistikler, bölüm listesi | `src/content/site.ts` |
| Ekip üyeleri (isim, görev, bölüm, renk, fotoğraf) | `src/content/team.ts` – fotoğraflar `public/team/` |
| Etkinlikler | `src/content/events.ts` |
| Sıkça sorulan sorular | `src/content/faq.ts` |
| Form alanları ve ilgi alanları | `src/lib/schema.ts` |

## Başvuruların toplanması

Form `POST /api/basvuru` ucuna gider. `.env.local` dosyasında `APPLICATION_WEBHOOK_URL` tanımlıysa başvuru JSON olarak oraya iletilir; tanımlı değilse yalnızca sunucu günlüğüne yazılır.

En kolay yol **Google Sheets**: bir Google Apps Script web uygulaması oluşturup `doPost` içinde gelen JSON'u tabloya ekleyin, yayınlanan adresi `APPLICATION_WEBHOOK_URL` olarak girin. Discord webhook'u veya Make/Zapier da kullanılabilir.

## Yayına alma

Vercel'e GitHub deposunu bağlamak yeterli. Yayına aldıktan sonra `src/content/site.ts` içindeki `url` alanını gerçek adresle güncelleyin.

## Yapı

```
src/
  app/            sayfalar (/, /hakkimizda, /etkinlikler, /ekip, /basvuru, /iletisim), API ucu, kapak görseli
  components/     bileşenler (ConnectionMap, EventTicket, TeamCard, MemberCard, ApplicationForm ...)
  content/        tüm metin ve veri içeriği
  lib/            zod şeması, tarih ve renk yardımcıları
  assets/         kapak görselinde kullanılan yazı tipi
```
