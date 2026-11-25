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

## Site Vercel'de yayınlanıyorsa: kısa yol

Vercel, Supabase veritabanını kendi panelinden ekleyebilir ve bağlantı değerlerini projeye kendiliğinden tanımlar. Bu durumda aşağıdaki **1. ve 4. adımları atla**:

1. Vercel'de projeyi aç. **Storage** sekmesinden (ya da **Marketplace → Supabase**) yeni bir Supabase veritabanı oluştur. Bölge olarak **Frankfurt** seç ve veritabanını bu projeye bağla.
2. **Deployments** sekmesinde son yayını **Redeploy** et. Bağlantı değerleri ancak yeniden yayından sonra siteye işlenir.
3. Vercel'deki veritabanı sayfasından **Open in Supabase** ile Supabase panelini aç ve aşağıdaki **2. adımdan** devam et (tablolar), ardından **3. adım** (yönetim ekibi).

Kontrol: **Settings → Environment Variables** altında `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (eski kurulumlarda `..._ANON_KEY`) görünmeli. Site ikisini de tanır.

Yeniden yayından sonra `/admin` adresinde "Kim giriyor?" yerine e-posta ve şifre soran giriş ekranı çıkıyorsa bağlantı kurulmuştur.

---

## 1. Supabase projesi aç

1. [supabase.com](https://supabase.com) adresinde ücretsiz hesap aç.
2. **New project** ile bir proje oluştur. Bölge olarak **Frankfurt (eu-central-1)** seç. Veritabanı şifresini bir yere not et.

## 2. Tabloları ve güvenlik kurallarını kur

1. Sol menüden **SQL Editor**'ü aç.
2. Bu depodaki [`supabase/schema.sql`](../supabase/schema.sql) dosyasının tamamını yapıştır ve **Run** de.

Bu adım başvuru tablosunu ve erişim kurallarını oluşturur: ziyaretçiler yalnızca başvuru **ekleyebilir**, başvuruları yalnızca yöneticiler **okuyabilir**.

## 3. Yönetim ekibini oluştur

Panel üç kişiliktir: **bir başkan** ve **iki başkan yardımcısı**. Herkes kendi hesabıyla girer ve girişte adıyla karşılanır ("Hoş geldiniz, Ahmet Bey"). "Bey / Hanım" hitabı yalnızca bu karşılamada kullanılır; panelin diğer yerlerinde kişi adı soyadıyla görünür.

1. **Authentication → Users → Add user → Create new user** ile her kişi için e-posta ve şifre gir. "Auto Confirm User" işaretli olsun. (Üç kişi için üç kez.)
2. **SQL Editor**'de aşağıdaki komutu kendi bilgilerinizle çalıştır. Her satırda sırasıyla **ad soyad**, **görev**, **hitap** ve o kişinin **e-postası** yazıyor:

   ```sql
   insert into public.admins (user_id, full_name, role, honorific)
   select id, 'Ahmet Yılmaz', 'baskan', 'Bey' from auth.users where email = 'baskan@ornek.com';

   insert into public.admins (user_id, full_name, role, honorific)
   select id, 'Elif Demir', 'baskan_yardimcisi', 'Hanım' from auth.users where email = 'yardimci1@ornek.com';

   insert into public.admins (user_id, full_name, role, honorific)
   select id, 'Mert Kaya', 'baskan_yardimcisi', 'Bey' from auth.users where email = 'yardimci2@ornek.com';
   ```

   | Alan | Yazılabilecek değerler |
   | --- | --- |
   | Görev | `baskan` ya da `baskan_yardimcisi` |
   | Hitap (yalnızca karşılamada kullanılır) | `Bey` ya da `Hanım` |

Kurallar veritabanında tanımlıdır: en fazla bir başkan ve iki başkan yardımcısı olabilir; dördüncü kişi eklenmeye çalışılırsa komut hata verir. Ekipte olmayan bir hesap giriş yapsa bile hiçbir başvuruyu göremez.

**Yetkiler:** Üç kişi de başvuruları görür, arar, durumunu ve notunu değiştirir. Bir başvuruyu **kalıcı olarak silmek yalnızca başkana** açıktır; bu kural da veritabanında tanımlıdır.

Panel ayrıca her başvurunun durumunu **kimin** değiştirdiğini gösterir ("Durumu Elif Demir güncelledi"). Bu bilgiyi veritabanı kendisi kaydeder; elle değiştirilemez.

**Birini değiştirmek için** (ör. yeni dönemde başkan değişti): eski kişiyi **Authentication → Users** bölümünden sil (ekip kaydı da silinir), yeni kişiyi 1. ve 2. adımla ekle. Yalnızca adı ya da hitabı düzeltmek için:

```sql
update public.admins set full_name = 'Yeni Ad Soyad', honorific = 'Hanım'
where user_id = (select id from auth.users where email = 'kisi@ornek.com');
```

**Önerilir:** **Authentication → Sign In / Providers** altında "Allow new users to sign up" seçeneğini kapat. Böylece kimse kendi kendine hesap açamaz.

## 4. Siteyi veritabanına bağla

1. Supabase'de **Project Settings → API** sayfasından iki değeri kopyala:
   - **Project URL** (ör. `https://abcd1234.supabase.co`)
   - **publishable** anahtarı (eski projelerde adı **anon / public**)
2. Depodaki [`src/admin/config.ts`](../src/admin/config.ts) dosyasını aç ve iki değeri tırnakların arasına yapıştır:

   ```ts
   supabaseUrl: "https://abcd1234.supabase.co",
   supabaseAnonKey: "eyJhbGciOi...",
   ```

3. Değişikliği gönder (commit). Site kendiliğinden yeniden yayınlanır.

Artık başvuru formu kayıtları veritabanına yazar ve `/admin` adresinde gerçek hesapla giriş yapılır.

Bu iki değer herkese açık değerlerdir: siteyi açan herkesin tarayıcısına zaten gönderilir. Koruma, 2. adımda kurulan erişim kurallarıyla sağlanır. Dosyaya yazmak istemezsen aynı değerleri GitHub'da **Settings → Secrets and variables → Actions → Variables** altında `SUPABASE_URL` ve `SUPABASE_ANON_KEY` adlarıyla da verebilirsin.

> **Dikkat:** `service_role` anahtarını ve veritabanı şifresini hiçbir zaman depoya, siteye ya da bir sohbete yazma. O anahtar tüm kuralları aşar. Sitede yalnızca `anon` anahtarı kullanılır.

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

[`src/admin/config.ts`](../src/admin/config.ts) dosyasındaki `vapidPublicKey` alanına **açık** anahtarı yapıştır ve değişikliği gönder. (GitHub değişkeni olarak vermek istersen adı `VAPID_PUBLIC_KEY`.)

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
| Panel hâlâ "Demo modu" diyor | Vercel'de: veritabanı projeye bağlanmamış ya da bağlandıktan sonra Redeploy yapılmamış. GitHub Pages'te: `src/admin/config.ts` içindeki iki değer boş |
| "Bu hesabın yönetim paneli yetkisi yok" | Hesap yönetim ekibine (`admins` tablosu) eklenmemiş: 3. adımdaki SQL |
| "Yalnızca bir başkan olabilir" hatası | Ekipte zaten bir başkan var; önce eskisini sil ya da görevini değiştir |
| Form "kaydedilemedi" diyor | `schema.sql` çalıştırılmamış ya da anon anahtarı yanlış kopyalanmış |
| Bildirim gelmiyor | 5. adımdaki dört parçadan biri eksik. Supabase'de **Edge Functions → Logs** fonksiyonun çağrılıp çağrılmadığını gösterir |
| iPhone'da bildirim seçeneği yok | Uygulama ana ekrana eklenmemiş, Safari sekmesinde açılmış |

## Güvenlik ve kişisel veriler

- Başvurular ad, telefon ve e-posta içerir. Panele yalnızca yönetim ekibi (başkan ve iki yardımcısı) girebilir.
- Görevi biten kişiyi **Authentication → Users** bölümünden sil; ekip kaydı da kendiliğinden silinir.
- Herkes kendi hesabını kullansın; şifre paylaşılırsa "kim işlem yaptı" kaydı anlamını yitirir.
- İşi biten başvuruları panelden silebilir, dönem sonunda **Excel** düğmesiyle yedek alabilirsin.

## Neler test edildi

Depodaki kod yerelde şu şekilde sınandı:

- Erişim kuralları gerçek PostgreSQL üzerinde: ziyaretçi yalnızca ekleyebiliyor; ekipte olmayan hesap hiçbir kaydı göremiyor; ekip bir başkan ve iki yardımcıyla sınırlı; silme yalnızca başkanda (arayüz atlansa bile); "kim işlem yaptı" kaydı sahtelenemiyor.
- Form → veritabanı → panel akışı tarayıcıda: üç ayrı hesapla giriş ve kişiye özel karşılama, yetkisiz hesap, durum ve not değişikliği, silme.
- Bildirim şifrelemesi bağımsız kütüphanelerle; uygulamanın bildirimi gösterip doğru başvuruya yönlendirmesi tarayıcıda.

Gerçek bir Supabase projesiyle (hesaplı giriş servisi, anlık güncelleme ve telefona gerçek bildirim teslimi) henüz denenmedi. Kurulumdan sonra bir deneme başvurusu göndererek doğrulayın.
