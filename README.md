# Nexus Öğrenci Kulübü – Web Sitesi

Karabük Üniversitesi **Nexus** öğrenci kulübünün tanıtım sitesi. Nexus "bağ" demek; site de bu fikir üzerine kurulu: farklı bölümleri birbirine bağlayan bir kulübü tanıtır, ekibi gösterir, etkinlikleri listeler ve üyelik başvurusu alır.

## Tasarım fikri

"Kampüs afişi": krem kağıt zemin, mürekkep siyahı kalın çizgiler, sert gölgeler ve her biri bir bölümü temsil eden canlı renkler. Öne çıkan parçalar:

- **Bağlantı haritası** (ana sayfa): Canvas ile çizilen etkileşimli ağ. Her etiket bir bölüm, ortadaki düğüm Nexus logosunun X işareti. İmleç "Sen" düğümüdür; yaklaştığı bölümlerle bağ kurar ve sayaç güncellenir.
- **Bilet görünümlü etkinlik kartları**: tarih koçanı, kategori rengi ve "X gün kaldı" sayacı. Site her gece yeniden derlendiği için tarihi geçen etkinlik kendiliğinden "geçmiş"e düşer.
- **Afiş tarzı ekip kartları**: her üyenin GIF gibi dönen kısa klibi, altında etiket gibi yapıştırılmış isim ve görev.
- **Canlı üye kartı** (başvuru sayfası): form doldurulurken kart anında güncellenir, gönderince üzerine "Başvuru alındı" damgası basılır.

Renkler ve yazı tipleri tek yerden yönetilir: `src/app/globals.css` içindeki `@theme` bloğu. Ana renkler kulüp logosundan ölçülmüştür: mavi `#015efb`, lacivert `#011e45` ve siyah. Limon, mercan, sarı ve lila farklı bölümleri temsil eden yardımcı vurgulardır.

## Logo

Logo dosyaları `public/brand/` altındadır ve `src/components/Logo.tsx` üzerinden kullanılır:

| Dosya | Kullanım |
| --- | --- |
| `nexus-wordmark.png` | Yalnızca NEXUS yazısı; menü ve küçük alanlar |
| `nexus-logo.png` | Altında "Karabük Üniversitesi" yazan tam logo |
| `nexus-*-light.png` | Koyu zeminler için açık sürüm (harfler beyaz, mavi ok aynı) |

Logodaki X işareti ayrıca SVG olarak çizilmiştir (`LogoMark`); favicon'da, bağlantı haritasının merkezinde ve kayan şeritlerdeki ok ayraçlarında kullanılır.

## Teknolojiler

- **Next.js 16** (App Router, statik dışa aktarım) + **React 19** + **TypeScript**
- **Tailwind CSS v4** ile özel tasarım sistemi
- **react-hook-form + zod** ile doğrulanan başvuru formu (yalnızca `@ogrenci.karabuk.edu.tr` e-postası kabul edilir)
- Canvas 2D ile yazılmış, kütüphanesiz etkileşimli animasyon
- `next/font` (Bricolage Grotesque, DM Sans, Instrument Serif, JetBrains Mono)
- SEO: `metadata`, otomatik üretilen Open Graph kapak görseli, `sitemap.xml`, `robots.txt`
- Erişilebilirlik: klavye odakları, "içeriğe atla" bağlantısı, `aria-*` etiketleri, `prefers-reduced-motion` desteği, JS kapalıyken de okunabilir içerik

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statik site → out/
npx serve out      # derlenmiş siteyi yerelde aç
npm run lint
```

## İçeriği güncelleme

Şu anki ekip isimleri, etkinlikler ve sayılar **örnek içeriktir**. Hepsi `src/content/` altında, kod bilgisi gerektirmeden değiştirilebilir:

| Ne | Dosya |
| --- | --- |
| Kulüp adı, açıklama, e-posta, sosyal medya, istatistikler, bölüm listesi | `src/content/site.ts` |
| Ekip üyeleri (isim, görev, bölüm, renk, klip, fotoğraf) | `src/content/team.ts` – dosyalar `public/team/` |
| Etkinlikler | `src/content/events.ts` |
| Duyurular (gezi, stant, ekip alımı...) | `src/content/announcements.ts` |
| Fotoğraflar (Sizden Kalanlar) | `fotograflar/` klasörü |
| Sıkça sorulan sorular | `src/content/faq.ts` |
| Üyelik formu alanları ve "en çok ne ilgini çekiyor" seçenekleri | `src/lib/schema.ts` |

## Yayın (GitHub Pages)

Site tamamen statik olarak üretilir (`npm run build` → `out/` klasörü) ve GitHub Pages'te yayınlanır. `.github/workflows/deploy.yml` şunları yapar:

- Yayın dalına her push'ta siteyi derleyip yayınlar.
- Her gece siteyi yeniden derler; böylece etkinliklerdeki gün sayaçları güncel kalır.
- Depo ayarlarından elle de çalıştırılabilir (Actions → "Siteyi yayınla" → Run workflow).

İlk kurulumda depoda **Settings → Pages → Source: GitHub Actions** seçili olmalıdır.

Özel alan adı kullanılacaksa Settings → Pages bölümünden eklenir; alt yol (`/nexsus`) kendiliğinden kalkar.

### Önizleme modu

`src/content/site.ts` içindeki `preview: true` iken sitede "Önizleme" şeridi görünür ve site arama motorlarına kapalıdır. Ekip, etkinlik ve sayılar gerçek bilgilerle değiştirildikten sonra `false` yapın.

## Yönetim paneli

`/admin` adresinde üyelik başvurularının yönetildiği bir panel vardır. Telefona ve bilgisayara uygulama olarak yüklenebilir (PWA) ve yeni başvurularda bildirim gönderir.

- **Kişiye özel:** panel üç kişiliktir (bir başkan, iki başkan yardımcısı). Herkes kendi hesabıyla girer, adıyla karşılanır ("Hoş geldiniz, Ahmet Bey") ve başvurularda durumu kimin değiştirdiği görünür. Kalıcı silme yalnızca başkandadır.
- **Giriş:** e-posta ve şifre. Yalnızca yönetim ekibindeki hesaplar veri görebilir.
- **Özet:** yeni, toplam ve onaylanan başvuru sayıları, son 14 günün grafiği, en çok ilgi çeken konular.
- **Başvurular:** arama, duruma göre filtre, ayrıntı, tek dokunuşla arama / WhatsApp / e-posta, durum ve yönetici notu, silme, Excel'e aktarma.
- **Ayarlar:** bildirimler, uygulamayı yükleme, hesap.

Veritabanı bağlanana kadar panel **demo modunda** çalışır: giriş ekranında üç örnek yöneticiden biri seçilir, kurgusal başvurular gösterilir ve veriler yalnızca o cihazda durur. Gerçek kurulum için: **[docs/YONETIM-PANELI-KURULUM.md](docs/YONETIM-PANELI-KURULUM.md)**

Teknik yapı:

| Parça | Yer |
| --- | --- |
| Panel arayüzü | `src/admin/components/` |
| Bağlantı ayarları (herkese açık değerler) | `src/admin/config.ts` |
| Veri katmanı (demo ve Supabase) | `src/admin/backend*.ts` |
| Bildirim ve uygulama yükleme | `src/admin/push.ts`, `public/admin-sw.js`, `src/app/admin/manifest.webmanifest/` |
| Veritabanı şeması ve erişim kuralları | `supabase/schema.sql` |
| Bildirim gönderen sunucu fonksiyonu | `supabase/functions/yeni-basvuru-bildirimi/` |

## Duyurular

Etkinlik takvimine girmeyen her şey (gezi, stant, ekip alımı, genel haber) `/duyurular` sayfasında yayınlanır. Yeni duyuru eklemek için `src/content/announcements.ts` dosyasındaki listeye bir kayıt eklemek yeterlidir.

- `deadline` verilirse kartta "5 gün kaldı" sayacı görünür; tarih geçince duyuru kendiliğinden "Geçmiş duyurular"a düşer.
- `pinned: true` olan duyuru en üstte, büyük kart olarak durur.
- En güncel duyuru ana sayfanın üstünde tek satırlık bir şerit olarak da görünür.

## Sizden Kalanlar (fotoğraflar)

Stant, etkinlik ve gezi fotoğrafları `/sizden-kalanlar` sayfasında şipşak fotoğraf görünümünde dizilir; ana sayfada en yeni dört kare önizleme olarak yer alır.

Fotoğraf eklemek için kod yazmak gerekmez: `fotograflar/` klasöründe tarihle başlayan bir klasör açıp fotoğrafları içine atmak yeterlidir. Ayrıntılar: **[fotograflar/BENIOKU.md](fotograflar/BENIOKU.md)**

Yayın sırasında `scripts/build-gallery.mjs` fotoğrafları küçültür, telefonun yön bilgisini uygular ve konum gibi gömülü bilgileri kopyalara aktarmaz. Özgün dosyalar siteye yüklenmez.

## Ekip klipleri (GIF gibi dönen videolar)

Ekip kartlarında her üye için kısa, sessiz, döngülü bir klip gösterilebilir. Gerçek GIF yerine MP4 kullanılır: aynı görüntü yaklaşık 10 kat daha küçük dosyayla gelir ve telefonda da kendiliğinden oynar. Klipler yalnızca ekranda görünürken oynar, her kartta durdur/oynat düğmesi vardır.

1. Üye için 3 ila 8 saniyelik dikey bir video hazırlayın (ör. CapCut şablonuyla).
2. Videoyu küçültüp sesini kaldırın ve bir kapak karesi alın:

   ```bash
   ffmpeg -i kaynak.mov -an -vf "fps=24,scale=432:-2" -c:v libx264 -crf 31 -pix_fmt yuv420p -movflags +faststart public/team/ayse.mp4
   ffmpeg -ss 1 -i kaynak.mov -frames:v 1 -vf "scale=432:-2" public/team/ayse.jpg
   ```

3. `src/content/team.ts` içinde üyeye `clip: "ayse.mp4", photo: "ayse.jpg"` ekleyin.

Klip yoksa yalnızca `photo` verilebilir; o da yoksa kartta baş harfler görünür. `public/team/ornek.mp4` kulübün gönderdiği şablon videodur ve yalnızca görünümü göstermek için duruyor.

## Sosyal medya hesapları

Hesaplar `src/content/site.ts` içindeki `socials` ve `socialAccounts` alanlarından yönetilir (kaynak: linktr.ee/nexuskbu). Alt bilgi, iletişim sayfası, mobil menü ve ana sayfadaki "Bizi takipte kal" kutuları bu listeden üretilir.

## Başvuruların toplanması

Site statik olduğu için başvurular tarayıcıdan doğrudan kayıt yerine gönderilir. Öncelik sırası:

1. **Veritabanı bağlıysa** (yönetim paneli kurulumu yapıldıysa): başvuru veritabanına yazılır ve panelde görünür.
2. **Özel bir kayıt adresi tanımlıysa** (`APPLICATION_ENDPOINT` değişkeni, ör. Google Sheets'e yazan bir Apps Script): başvuru JSON olarak oraya gönderilir.
3. **Hiçbiri yoksa** (şu anki durum): form başvuru metnini hazırlar, panoya kopyalar ve kullanıcıyı kulübün Instagram mesajlarına yönlendirir.

## Yapı

```
src/
  app/            sayfalar (/, /hakkimizda, /duyurular, /etkinlikler, /sizden-kalanlar, /ekip, /basvuru, /iletisim, /admin)
  components/     bileşenler (ConnectionMap, EventTicket, TeamCard, MemberCard, ApplicationForm ...)
  content/        tüm metin ve veri içeriği
  admin/          yönetim paneli (arayüz, veri katmanı, bildirimler)
  lib/            zod şeması, tarih ve renk yardımcıları
  assets/         kapak görselinde kullanılan yazı tipi
supabase/         veritabanı şeması ve bildirim fonksiyonu
docs/             kurulum rehberleri
fotograflar/      Sizden Kalanlar sayfasının fotoğrafları (albüm klasörleri)
```
