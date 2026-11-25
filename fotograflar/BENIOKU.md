# Sizden Kalanlar: fotoğraf ekleme

Sitedeki **Sizden Kalanlar** sayfası bu klasörden beslenir. Kod yazmak gerekmez.

## Nasıl eklenir?

1. Bu klasörün içinde etkinlik için bir klasör aç. Adını tarihle başlat:

   ```
   fotograflar/2026-12-01-kampus-standi/
   ```

2. Fotoğrafları o klasöre at (JPG, PNG ya da WebP).
3. Değişikliği gönder (commit). Site kendiliğinden yeniden yayınlanır; fotoğraflar küçültülür ve sayfaya dizilir.

Klasör adındaki tarih albümün tarihi, geri kalanı başlığı olur: `2026-12-01-kampus-standi` → "Kampus Standi", 1 Aralık 2026.

## Başlığı ve açıklamaları düzeltmek (isteğe bağlı)

Türkçe karakterli başlık, açıklama ya da fotoğraf altı yazısı için klasöre `bilgi.json` ekle:

```json
{
  "baslik": "Kampüs Standı",
  "tarih": "2026-12-01",
  "aciklama": "Üç gün boyunca merkez kafeterya önündeydik.",
  "fotolar": {
    "IMG_1024.jpg": "Standın ilk sabahı",
    "IMG_1031.jpg": "Yeni üyelerimizle"
  }
}
```

## Bilmen gerekenler

- **Boyut:** Telefondan çıkan büyük dosyaları olduğu gibi atabilirsin; site yayınlarken küçültür. Özgün dosyalar siteye yüklenmez.
- **Konum bilgisi:** Fotoğrafın içine gömülü konum ve cihaz bilgileri yayınlanan kopyalara aktarılmaz.
- **iPhone (HEIC):** Çoğu durumda çalışır; işlenemeyen dosya atlanır ve yayın günlüğünde uyarı görünür. O dosyayı JPG olarak kaydedip tekrar ekle.
- **Sıra:** Fotoğraflar dosya adına göre, albümler en yeniden eskiye sıralanır.
- **İzin:** Yüzü net görünen kişilerin onayını al. Kaldırılması istenen fotoğrafı klasörden silmen yeterli.
