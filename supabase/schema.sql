-- =====================================================================
-- Nexus Yönetim Paneli - veritabanı şeması (Supabase / PostgreSQL)
--
-- Kurulum: Supabase panelinde SQL Editor'ü açın, bu dosyanın tamamını
-- yapıştırıp "Run" deyin. Tekrar çalıştırmak güvenlidir.
--
-- Güvenlik modeli (satır düzeyinde güvenlik, RLS):
--   * Herkes (anon)        : yalnızca yeni başvuru EKLEYEBİLİR; hiçbir şeyi okuyamaz.
--   * Yöneticiler (admins) : başvuruları okur, günceller, siler.
--   * Giriş yapmış ama yönetici listesinde olmayan biri hiçbir şeyi göremez.
-- Sitedeki "anon" anahtarı herkese açıktır; korumayı aşağıdaki kurallar sağlar.
-- =====================================================================

-- ---------- Tablolar ----------

create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text not null check (char_length(full_name) between 3 and 80),
  email       text not null check (char_length(email) between 5 and 120 and position('@' in email) > 1),
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
  notified    boolean not null default false
);

create index if not exists applications_created_at_idx on public.applications (created_at desc);

-- Panele girebilecek hesaplar. Bir hesabı yönetici yapmak için kurulum rehberindeki
-- "insert into public.admins ..." komutunu çalıştırın.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

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

-- ---------- Satır düzeyinde güvenlik ----------

alter table public.applications       enable row level security;
alter table public.admins             enable row level security;
alter table public.push_subscriptions enable row level security;

-- Başvurular: herkes ekleyebilir, ama yalnızca "yeni" durumda ve yönetici alanları boşken.
drop policy if exists "basvuru_ekle" on public.applications;
create policy "basvuru_ekle" on public.applications
  for insert to anon, authenticated
  with check (status = 'new' and admin_note is null and seen = false and notified = false);

drop policy if exists "basvuru_oku" on public.applications;
create policy "basvuru_oku" on public.applications
  for select to authenticated using (public.is_admin());

drop policy if exists "basvuru_guncelle" on public.applications;
create policy "basvuru_guncelle" on public.applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "basvuru_sil" on public.applications;
create policy "basvuru_sil" on public.applications
  for delete to authenticated using (public.is_admin());

-- Yönetici listesi: kişi yalnızca kendi kaydını görebilir (panel "yetkim var mı" diye bakar).
-- Ekleme ve silme yalnızca SQL Editor üzerinden (proje sahibi) yapılır.
drop policy if exists "yonetici_kendini_gor" on public.admins;
create policy "yonetici_kendini_gor" on public.admins
  for select to authenticated using (user_id = auth.uid());

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
