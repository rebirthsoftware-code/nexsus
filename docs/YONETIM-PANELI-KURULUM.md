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

Vercel, Supabase veritabanını kendi panelinden ekleyebilir. Bu yolda bağlantı değerleri siteye kendiliğinden işlenir ve **tablolar da kendiliğinden kurulur**; aşağıdaki 1., 2. ve 4. adımları atlarsın.

1. Vercel'de projeyi aç. **Storage** sekmesinden **Create Database → Supabase** ile yeni bir veritabanı oluştur. Bölge olarak **Frankfurt** seç ve veritabanını bu projeye bağla (**Connect**).
2. **Deployments** sekmesinde son yayını **Redeploy** et.

Yeniden yayın sırasında iki şey olur:

- Site veritabanına bağlanır: başvuru formu kayıtları oraya yazar, `/admin` gerçek girişe geçer.
- `scripts/setup-db.mjs` betiği `supabase/schema.sql` dosyasını veritabanına uygular. Sonucu yayının **Build Logs** kısmında `[veritabanı]` ile başlayan satırlarda görürsün: "Tablolar kuruldu (3/3 tablo hazır)".

- Betik panelin **yazılımcı hesabını** açar ve giriş bilgilerini aynı günlüğe yazar ("PANELİN YAZILIMCI HESABI AÇILDI"). Bu günlüğü yalnızca Vercel projesinin sahibi görebilir.

Geriye yalnızca yönetim ekibini eklemek kalır. Bunun için SQL gerekmez: günlükteki bilgilerle `/admin` adresinden gir ve **Ekip** bölümünü kullan (bkz. **3. adım**).

Notlar:

- Şema dosyası değişirse bir sonraki yayında tablolar kendiliğinden güncellenir; değişmediyse betik hiçbir şeye dokunmaz.
- Betik bir sorunla karşılaşırsa siteyi yayından alıkoymaz, nedenini günlüğe yazar. O durumda 2. adımdaki gibi şemayı elle çalıştırabilirsin.
- Bağlantı şifrelidir. Supabase kendi sertifika otoritesini kullandığı için betik, Vercel'in verdiği bağlantı ayarına (`sslmode=require`) uyarak sunucu sertifikasını doğrulamadan bağlanır. Tam doğrulama istersen Supabase'in kök sertifikasını `SUPABASE_CA_CERT`, `NEXUS_DB_STRICT_TLS=1` ile birlikte Vercel ortam değişkeni olarak tanımla.

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

Ekibi, sitenin **yazılımcısı** panelin içinden yönetir. SQL yazmak gerekmez.

### Yazılımcı hesabı

Yazılımcı hesabı kendiliğinden açılır: site veritabanına bağlı olarak derlendiğinde `scripts/setup-db.mjs` hesabı oluşturur ve giriş bilgilerini derleme günlüğüne yazar.

1. Vercel'de **Deployments → son yayın → Build Logs** bölümünü aç ve `[veritabanı]` ile başlayan satırları bul:

   ```
   [veritabanı]   PANELİN YAZILIMCI HESABI AÇILDI
   [veritabanı]   Giriş e-postası : yazilimci@nexus.panel
   [veritabanı]   Geçici şifre    : xxxx-xxxx-xxxx-xxxx
   [veritabanı]   Giriş denemesi  : başarılı
   ```

2. Sitenin `/admin` adresinden bu bilgilerle gir.
3. **Ayarlar → Şifre değiştir** ile kendi şifreni belirle. Geçici şifre o andan sonra çalışmaz.

Sen panele girene kadar aynı geçici şifre her yayının günlüğüne yeniden yazılır; girdikten sonra bir daha yazılmaz. Şifrenin açık hali hiçbir yerde saklanmaz.

İsteğe bağlı Vercel ortam değişkenleri (**Settings → Environment Variables**):

| Değişken | Ne işe yarar |
| --- | --- |
| `NEXUS_DEVELOPER_EMAIL` | Yazılımcı hesabının giriş e-postası. Gerçek bir posta kutusu olması gerekmez; hiçbir e-posta gönderilmez. Yalnızca hesap ilk açılırken okunur. |
| `NEXUS_DEVELOPER_PASSWORD` | Şifreyi kendin belirlersin (en az 8 karakter). Bu durumda şifre günlüğe **yazılmaz**. |
| `NEXUS_DEVELOPER_RESET` | Şifreni unutursan: bu değişkene yeni bir değer yaz (ör. bugünün tarihi) ve yeniden yayınla. Günlüğe yeni bir geçici şifre yazılır. Aynı değer ikinci kez sıfırlamaz. |

### Ekibi ekle ve değiştir

Yazılımcı hesabıyla girince menüde **Ekip** bölümü görünür. Bu bölümü yalnızca yazılımcı görür; başkan ve başkan yardımcılarının menüsünde yoktur.

- **Ekle:** boş koltuktaki "Başkan ekle" ya da "Başkan Yardımcısı ekle" düğmesine bas. Ad soyadı, hitabı (Bey / Hanım), giriş e-postasını ve şifreyi gir. Şifreyi "Üret" düğmesi senin yerine üretir. Kayıttan sonra giriş bilgileri bir kez gösterilir; kişiye sen iletirsin.
- **Düzenle:** adı, hitabı ve görevi değiştirir. Birini başkan yaptığında o anki başkan kendiliğinden başkan yardımcısı olur.
- **Şifre yenile:** şifresini unutan kişiye yeni şifre verir.
- **Kaldır:** kişiyi ekipten çıkarır ve giriş hesabını siler. Başvurular silinmez.

Her yönetici kendi şifresini **Ayarlar → Şifre değiştir** ile değiştirebilir.

**Sitede görünüm:** Ekibe eklenen kişilerin **ad soyadı ve görevi** sitenin ana sayfasındaki ve Ekip sayfasındaki yönetim kurulu kartlarında kendiliğinden görünür; panelde yapılan değişiklik siteye de yansır. E-posta, hitap ve yazılımcı hesabı sitede yayınlanmaz. Bir üyeye bölüm, fotoğraf ya da söz eklemek için [`src/content/team.ts`](../src/content/team.ts) içindeki `management.details` kullanılır.

Kurallar veritabanında tanımlıdır: en fazla bir başkan ve iki başkan yardımcısı olabilir. Ekipte olmayan bir hesap giriş yapsa bile hiçbir başvuruyu göremez. Ekibi düzenleyen fonksiyonları yalnızca yazılımcı çağırabilir; panel arayüzü atlansa bile başka hiç kimse ekibi değiştiremez. Yazılımcı hesabı yöneticilere görünmez.

**Yetkiler:** Üç yönetici de başvuruları görür, arar, durumunu ve notunu değiştirir. Bir başvuruyu **kalıcı olarak silmek yalnızca başkana** (ve yazılımcıya) açıktır; bu kural da veritabanında tanımlıdır.

Panel ayrıca her başvurunun durumunu **kimin** değiştirdiğini gösterir ("Durumu Elif Demir güncelledi"). Bu bilgiyi veritabanı kendisi kaydeder; elle değiştirilemez.

> Vercel dışında bir yayın kullanıyorsan (ör. yalnızca GitHub Pages), yazılımcı hesabını açmak için bilgisayarında bir kez `POSTGRES_URL="<Supabase bağlantı adresi>" npm run veritabani` çalıştır. Giriş bilgileri terminale yazılır.

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
| "Bu hesabın yönetim paneli yetkisi yok" | Hesap yönetim ekibinde değil. Yazılımcı, paneldeki **Ekip** bölümünden ekler |
| "Yalnızca bir başkan olabilir" hatası | Ekipte zaten bir başkan var. Yeni başkanı yardımcı olarak ekleyip **Düzenle** ile başkan yap ya da önce eskisini kaldır |
| Günlükte "Giriş denemesi : BAŞARISIZ" yazıyor | Yazılımcı hesabı açıldı ama giriş servisi kabul etmedi. Parantez içindeki kodu not et; hesap Supabase'de **Authentication → Users** bölümünden elle de açılabilir |
| Yazılımcı şifresi unutuldu | Vercel'de `NEXUS_DEVELOPER_RESET` değişkenine yeni bir değer yazıp yeniden yayınla (bkz. 3. adım) |
| Form "kaydedilemedi" diyor | `schema.sql` çalıştırılmamış ya da anon anahtarı yanlış kopyalanmış |
| Bildirim gelmiyor | 5. adımdaki dört parçadan biri eksik. Supabase'de **Edge Functions → Logs** fonksiyonun çağrılıp çağrılmadığını gösterir |
| iPhone'da bildirim seçeneği yok | Uygulama ana ekrana eklenmemiş, Safari sekmesinde açılmış |

## Güvenlik ve kişisel veriler

- Başvurular ad, telefon ve e-posta içerir. Panele yalnızca yönetim ekibi (başkan ve iki yardımcısı) girebilir.
- Görevi biten kişiyi paneldeki **Ekip** bölümünden kaldır; giriş hesabı da silinir.
- Yazılımcı hesabının geçici şifresi yalnızca Vercel derleme günlüğüne yazılır. İlk girişte kendi şifreni belirle.
- Herkes kendi hesabını kullansın; şifre paylaşılırsa "kim işlem yaptı" kaydı anlamını yitirir.
- İşi biten başvuruları panelden silebilir, dönem sonunda **Excel** düğmesiyle yedek alabilirsin.

## Neler test edildi

Depodaki kod yerelde şu şekilde sınandı:

- Erişim kuralları gerçek PostgreSQL üzerinde: ziyaretçi yalnızca ekleyebiliyor; ekipte olmayan hesap hiçbir kaydı göremiyor; ekip bir başkan ve iki yardımcıyla sınırlı; silme yalnızca başkanda (arayüz atlansa bile); "kim işlem yaptı" kaydı sahtelenemiyor; ekibi yalnızca yazılımcı değiştirebiliyor ve yöneticiler yazılımcı hesabını göremiyor.
- Yazılımcı bölümü tarayıcıda: geçici şifreyle giriş, yönetici ekleme, düzenleme, görev değişimi, şifre yenileme, kaldırma, şifre değiştirme; telefon, yatay ve dar ekran düzeni.
- Form → veritabanı → panel akışı tarayıcıda: üç ayrı hesapla giriş ve kişiye özel karşılama, yetkisiz hesap, durum ve not değişikliği, silme.
- Bildirim şifrelemesi bağımsız kütüphanelerle; uygulamanın bildirimi gösterip doğru başvuruya yönlendirmesi tarayıcıda.

Gerçek bir Supabase projesiyle (hesaplı giriş servisi, anlık güncelleme ve telefona gerçek bildirim teslimi) henüz denenmedi. Kurulumdan sonra bir deneme başvurusu göndererek doğrulayın.
