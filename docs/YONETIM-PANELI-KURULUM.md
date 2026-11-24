# Yönetim paneli kurulumu

Yönetim paneli sitenin `/admin` adresinde çalışır. Kurulum yapılana kadar **demo modunda**dır: örnek başvurular gösterir, gerçek başvurular panele düşmez.

Bu rehber paneli gerçek veritabanına bağlar. Toplam süre yaklaşık 20 dakikadır ve her şey ücretsizdir.

| Adım | Ne kazandırır |
| --- | --- |
| 1 – 4 | Siteden gelen başvurular panele düşer, hesapla giriş yapılır |
| 5 | Panel kapalıyken de telefona bildirim gelir |
| 6 | Panel telefona uygulama olarak yüklenir |

Veritabanı olarak [Supabase](https://supabase.com) kullanılır: ücretsiz katmanı bir kulüp için fazlasıyla yeterlidir.

---

## 1. Supabase projesi aç

1. [supabase.com](https://supabase.com) adresinde ücretsiz hesap aç.
2. **New project** ile bir proje oluştur. Bölge olarak **Frankfurt (eu-central-1)** seç. Veritabanı şifresini bir yere not et.

## 2. Tabloları ve güvenlik kurallarını kur

1. Sol menüden **SQL Editor**'ü aç.
2. Bu depodaki [`supabase/schema.sql`](../supabase/schema.sql) dosyasının tamamını yapıştır ve **Run** de.

Bu adım başvuru tablosunu ve erişim kurallarını oluşturur: ziyaretçiler yalnızca başvuru **ekleyebilir**, başvuruları yalnızca yöneticiler **okuyabilir**.

## 3. Yönetici hesabı oluştur

1. **Authentication → Users → Add user → Create new user** ile e-posta ve şifre gir. "Auto Confirm User" işaretli olsun.
2. **SQL Editor**'de şu komutu kendi e-postanla çalıştır:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'senin@epostan.com';
   ```

Her yeni yönetici için bu iki adımı tekrarla. Yönetici listesinde olmayan bir hesap giriş yapsa bile hiçbir başvuruyu göremez.

**Önerilir:** **Authentication → Sign In / Providers** altında "Allow new users to sign up" seçeneğini kapat. Böylece kimse kendi kendine hesap açamaz.

## 4. Siteyi veritabanına bağla

1. Supabase'de **Project Settings → API** sayfasından iki değeri kopyala:
   - **Project URL** (ör. `https://abcd1234.supabase.co`)
   - **anon / public** anahtarı
2. GitHub deposunda **Settings → Secrets and variables → Actions → Variables** sekmesinde iki değişken oluştur:

   | Ad | Değer |
   | --- | --- |
   | `SUPABASE_URL` | Project URL |
   | `SUPABASE_ANON_KEY` | anon / public anahtarı |

3. **Actions → Siteyi yayınla (GitHub Pages) → Run workflow** ile siteyi yeniden yayınla.

Artık başvuru formu kayıtları veritabanına yazar ve `/admin` adresinde gerçek hesapla giriş yapılır.

> **Dikkat:** `service_role` anahtarını hiçbir zaman GitHub'a ya da siteye yazma. O anahtar tüm kuralları aşar. Sitede yalnızca `anon` anahtarı kullanılır; o anahtar herkese açık olacak şekilde tasarlanmıştır.

## 5. Bildirimleri kur (uygulama kapalıyken de gelsin)

Bu adım atlanırsa bildirimler yalnızca panel açıkken gösterilir.

### 5a. Anahtar çifti üret

Bilgisayarında Node.js varsa depo klasöründe:

```bash
npm run vapid
```

Node.js yoksa bilgisayarda herhangi bir sayfada tarayıcı konsolunu aç (F12 → Console), şunu yapıştır:

```js
const k = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
const j = await crypto.subtle.exportKey("jwk", k.privateKey);
const r = new Uint8Array(await crypto.subtle.exportKey("raw", k.publicKey));
console.log("VAPID_PUBLIC_KEY =", btoa(String.fromCharCode(...r)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""));
console.log("VAPID_PRIVATE_KEY =", j.d);
```

İki değer çıkar. **Gizli anahtarı (PRIVATE) kimseyle paylaşma ve depoya ekleme.**

### 5b. Açık anahtarı siteye ver

GitHub'da (4. adımdaki yerde) bir değişken daha oluştur: `VAPID_PUBLIC_KEY` = açık anahtar. Sonra siteyi yeniden yayınla.

### 5c. Bildirim fonksiyonunu yükle

1. Supabase'de **Edge Functions → Deploy a new function → Via Editor**.
2. Ad: `yeni-basvuru-bildirimi`
3. İçeriğe [`supabase/functions/yeni-basvuru-bildirimi/index.ts`](../supabase/functions/yeni-basvuru-bildirimi/index.ts) dosyasının tamamını yapıştır, **Deploy** de.
4. **Edge Functions → Secrets** altında üç değer ekle:

   | Ad | Değer |
   | --- | --- |
   | `VAPID_PUBLIC_KEY` | açık anahtar |
   | `VAPID_PRIVATE_KEY` | gizli anahtar |
   | `VAPID_SUBJECT` | `mailto:` ile başlayan bir iletişim adresi, ör. `mailto:kulup@ornek.com` |

### 5d. Yeni başvuruda fonksiyonu tetikle

**Database → Webhooks → Create a new hook**:

- Table: `applications`
- Events: yalnızca **Insert**
- Type: **Supabase Edge Functions**
- Function: `yeni-basvuru-bildirimi`, Method: POST

### 5e. Cihazında bildirimleri aç

Panelde **Ayarlar → Bildirimleri aç**. Her yönetici bunu kendi cihazında bir kez yapar.

## 6. Telefona uygulama olarak yükle

- **Android (Chrome):** paneli aç, **Ayarlar → Uygulamayı yükle** düğmesine bas. Düğme görünmüyorsa Chrome menüsünden "Uygulamayı yükle" ya da "Ana ekrana ekle".
- **iPhone / iPad (Safari):** paneli Safari'de aç, **Paylaş → Ana Ekrana Ekle**. Ardından uygulamayı ana ekrandan açıp bildirimleri etkinleştir. iPhone'da bildirimler yalnızca ana ekrana eklenmiş uygulamada çalışır (iOS 16.4 ve sonrası).
- **Bilgisayar (Chrome / Edge):** adres çubuğunun sağındaki yükleme simgesine tıkla.

---

## Sorun giderme

| Belirti | Olası neden |
| --- | --- |
| Panel hâlâ "Demo modu" diyor | GitHub değişkenleri eksik ya da site değişkenlerden sonra yeniden yayınlanmadı |
| "Bu hesabın yönetim paneli yetkisi yok" | Hesap `admins` tablosuna eklenmemiş (3. adımdaki SQL) |
| Form "kaydedilemedi" diyor | `schema.sql` çalıştırılmamış ya da anon anahtarı yanlış kopyalanmış |
| Bildirim gelmiyor | 5. adımdaki dört parçadan biri eksik. Supabase'de **Edge Functions → Logs** fonksiyonun çağrılıp çağrılmadığını gösterir |
| iPhone'da bildirim seçeneği yok | Uygulama ana ekrana eklenmemiş, Safari sekmesinde açılmış |

## Güvenlik ve kişisel veriler

- Başvurular ad, telefon ve e-posta içerir. Panele yalnızca gerçekten ihtiyacı olan kişileri yönetici yap.
- Ayrılan bir yöneticiyi **Authentication → Users** bölümünden sil; `admins` kaydı da kendiliğinden silinir.
- İşi biten başvuruları panelden silebilir, dönem sonunda **Excel** düğmesiyle yedek alabilirsin.

## Neler test edildi

Depodaki kod yerelde şu şekilde sınandı:

- Erişim kuralları gerçek PostgreSQL üzerinde: ziyaretçi yalnızca ekleyebiliyor; yönetici olmayan hesap hiçbir kaydı göremiyor.
- Form → veritabanı → panel akışı tarayıcıda: giriş, yanlış şifre, yetkisiz hesap, durum ve not değişikliği, silme.
- Bildirim şifrelemesi bağımsız kütüphanelerle; uygulamanın bildirimi gösterip doğru başvuruya yönlendirmesi tarayıcıda.

Gerçek bir Supabase projesiyle (hesaplı giriş servisi, anlık güncelleme ve telefona gerçek bildirim teslimi) henüz denenmedi. Kurulumdan sonra bir deneme başvurusu göndererek doğrulayın.
