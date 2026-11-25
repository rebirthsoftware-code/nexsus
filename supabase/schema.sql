-- =====================================================================
-- Nexus Yönetim Paneli - veritabanı şeması (Supabase / PostgreSQL)
--
-- Kurulum: Supabase panelinde SQL Editor'ü açın, bu dosyanın tamamını
-- yapıştırıp "Run" deyin. Tekrar çalıştırmak güvenlidir.
--
-- Güvenlik modeli (satır düzeyinde güvenlik, RLS):
--   * Herkes (anon)        : yalnızca yeni başvuru EKLEYEBİLİR; hiçbir şeyi okuyamaz.
--   * Yönetim ekibi (admins): başvuruları okur ve günceller. Kalıcı silme yalnızca başkandadır.
--   * Giriş yapmış ama yönetici listesinde olmayan biri hiçbir şeyi göremez.
-- Sitedeki "anon" anahtarı herkese açıktır; korumayı aşağıdaki kurallar sağlar.
-- =====================================================================

-- ---------- Tablolar ----------

create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text not null check (char_length(full_name) between 3 and 80),
  -- Yalnızca üniversitenin öğrenci e-postası kabul edilir (form da aynı kuralı uygular)
  email       text not null check (char_length(email) <= 120 and email ~* '^[^@[:space:]]+@ogrenci\.karabuk\.edu\.tr$'),
  phone       text not null check (char_length(phone) between 10 and 20),
  department  text not null check (char_length(department) between 2 and 80),
  class_year  text not null check (char_length(class_year) between 1 and 40),
  student_no  text check (char_length(student_no) <= 20),
  attractions text[] not null default '{}' check (cardinality(attractions) <= 10),
  note        text check (char_length(note) <= 500),
  -- Aşağıdaki alanları yalnızca yöneticiler değiştirebilir
  status      text not null default 'new' check (status in ('new', 'pending', 'approved', 'rejected')),
  admin_note  text check (char_length(admin_note) <= 1000),
  seen        boolean not null default false,
  notified    boolean not null default false,
  -- Durumu en son değiştiren yönetici ve zamanı (aşağıdaki tetikleyici doldurur)
  handled_by  uuid references auth.users (id) on delete set null,
  handled_at  timestamptz
);

-- Tablo daha önce kurulduysa yeni sütunları ekle
alter table public.applications add column if not exists handled_by uuid references auth.users (id) on delete set null;
alter table public.applications add column if not exists handled_at timestamptz;

-- Tablo daha önce eski e-posta kuralıyla kurulduysa kuralı güncelle (eski kayıtlara dokunmaz)
alter table public.applications drop constraint if exists applications_email_check;
alter table public.applications add constraint applications_email_check
  check (char_length(email) <= 120 and email ~* '^[^@[:space:]]+@ogrenci\.karabuk\.edu\.tr$') not valid;

create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- Yönetim ekibi: panele girebilecek hesaplar. Ekip üç kişidir: bir başkan, iki başkan yardımcısı.
-- Kişi eklemek için kurulum rehberindeki "insert into public.admins ..." komutunu çalıştırın.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name  text not null check (char_length(full_name) between 2 and 80),
  role       text not null check (role in ('baskan', 'baskan_yardimcisi')),
  -- Karşılamada kullanılan hitap: "Ahmet Bey", "Elif Hanım"
  honorific  text not null check (honorific in ('Bey', 'Hanım'))
);

-- Tablo daha önce (profil alanları olmadan) kurulduysa alanları ekle
alter table public.admins add column if not exists full_name text not null default 'Yönetici';
alter table public.admins add column if not exists role text not null default 'baskan_yardimcisi' check (role in ('baskan', 'baskan_yardimcisi'));
alter table public.admins add column if not exists honorific text not null default 'Bey' check (honorific in ('Bey', 'Hanım'));
alter table public.admins alter column full_name drop default;
alter table public.admins alter column role drop default;
alter table public.admins alter column honorific drop default;

-- Ekip sınırı: en fazla bir başkan ve iki başkan yardımcısı
create or replace function public.admins_enforce_limits()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.admins where role = 'baskan') > 1 then
    raise exception 'Yalnızca bir başkan olabilir.';
  end if;
  if (select count(*) from public.admins where role = 'baskan_yardimcisi') > 2 then
    raise exception 'En fazla iki başkan yardımcısı olabilir.';
  end if;
  return null;
end;
$$;

drop trigger if exists admins_limits on public.admins;
create trigger admins_limits
  after insert or update on public.admins
  for each statement execute function public.admins_enforce_limits();

-- Yöneticilerin cihazlarına bildirim gönderebilmek için abonelik kayıtları
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint   text not null unique check (endpoint like 'https://%'),
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ---------- Yardımcı fonksiyon ----------

-- İsteği yapan kişi yönetici mi? (security definer: admins tablosunu RLS'e takılmadan okur)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- İsteği yapan kişi başkan mı? (Kalıcı silme gibi yalnızca başkana açık işlemler için)
create or replace function public.is_president()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and role = 'baskan');
$$;

revoke all on function public.is_president() from public;
grant execute on function public.is_president() to anon, authenticated;

-- Başvurunun durumu değiştiğinde kimin, ne zaman değiştirdiğini kaydet.
-- Bu alanlar tarayıcıdan gelen değere bakılmadan burada doldurulur; elle değiştirilemez.
create or replace function public.applications_stamp_handler()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    new.handled_by := auth.uid();
    new.handled_at := now();
  else
    new.handled_by := old.handled_by;
    new.handled_at := old.handled_at;
  end if;
  return new;
end;
$$;

drop trigger if exists applications_handler on public.applications;
create trigger applications_handler
  before update on public.applications
  for each row execute function public.applications_stamp_handler();

-- ---------- Satır düzeyinde güvenlik ----------

alter table public.applications       enable row level security;
alter table public.admins             enable row level security;
alter table public.push_subscriptions enable row level security;

-- Başvurular: herkes ekleyebilir, ama yalnızca "yeni" durumda ve yönetici alanları boşken.
drop policy if exists "basvuru_ekle" on public.applications;
create policy "basvuru_ekle" on public.applications
  for insert to anon, authenticated
  with check (status = 'new' and admin_note is null and seen = false and notified = false and handled_by is null and handled_at is null);

drop policy if exists "basvuru_oku" on public.applications;
create policy "basvuru_oku" on public.applications
  for select to authenticated using (public.is_admin());

drop policy if exists "basvuru_guncelle" on public.applications;
create policy "basvuru_guncelle" on public.applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "basvuru_sil" on public.applications;
-- Kalıcı silme yalnızca başkandadır
create policy "basvuru_sil" on public.applications
  for delete to authenticated using (public.is_president());

-- Yönetim ekibi: yalnızca ekip üyeleri ekibi görebilir (panel adları ve görevleri buradan okur).
-- Ekipte olmayan bir hesap hiçbir satır göremez. Ekleme, değiştirme ve silme yalnızca
-- SQL Editor üzerinden (proje sahibi) yapılır.
drop policy if exists "yonetici_kendini_gor" on public.admins;
drop policy if exists "ekip_ekibi_gorur" on public.admins;
create policy "ekip_ekibi_gorur" on public.admins
  for select to authenticated using (public.is_admin());

-- Bildirim abonelikleri: yönetici yalnızca kendi cihazlarını yönetir.
drop policy if exists "abonelik_kendi" on public.push_subscriptions;
create policy "abonelik_kendi" on public.push_subscriptions
  for all to authenticated
  using (public.is_admin() and user_id = auth.uid())
  with check (public.is_admin() and user_id = auth.uid());

-- ---------- Yetkiler ----------
-- Ziyaretçiler başvuru tablosuna yalnızca ekleme yapabilir; diğer tablolara erişemez.

revoke all on public.applications, public.admins, public.push_subscriptions from anon, authenticated;
grant insert on public.applications to anon;
grant select, insert, update, delete on public.applications to authenticated;
grant select on public.admins to authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- ---------- Anlık güncelleme ----------
-- Panel açıkken yeni başvuruların kendiliğinden listeye düşmesi için.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'applications'
     ) then
    alter publication supabase_realtime add table public.applications;
  end if;
end $$;
