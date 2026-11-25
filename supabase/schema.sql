-- =====================================================================
-- Nexus Yönetim Paneli - veritabanı şeması (Supabase / PostgreSQL)
--
-- Kurulum: Supabase panelinde SQL Editor'ü açın, bu dosyanın tamamını
-- yapıştırıp "Run" deyin. Tekrar çalıştırmak güvenlidir.
--
-- Güvenlik modeli (satır düzeyinde güvenlik, RLS):
--   * Herkes (anon)        : yalnızca yeni başvuru EKLEYEBİLİR; hiçbir şeyi okuyamaz.
--   * Yönetim ekibi (admins): başvuruları okur ve günceller. Kalıcı silme yalnızca başkandadır.
--   * Yazılımcı            : yukarıdakilere ek olarak yönetim ekibini panelden düzenler.
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

-- Panele girebilecek hesaplar.
--   * Yönetim ekibi üç kişidir: bir başkan ('baskan') ve iki başkan yardımcısı ('baskan_yardimcisi').
--   * 'yazilimci' siteyi geliştiren kişidir: yönetim ekibini panelden ekler, değiştirir, kaldırır.
-- Yöneticiler SQL yazmadan, panelin yalnızca yazılımcıya görünen bölümünden eklenir.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name  text not null check (char_length(full_name) between 2 and 80),
  role       text not null check (role in ('baskan', 'baskan_yardimcisi', 'yazilimci')),
  -- Karşılamada kullanılan hitap: "Hoş geldiniz, Ahmet Bey". Yazılımcı için isteğe bağlıdır.
  honorific  text check (honorific in ('Bey', 'Hanım'))
);

-- Tablo daha önce (profil alanları olmadan) kurulduysa alanları ekle
alter table public.admins add column if not exists full_name text not null default 'Yönetici';
alter table public.admins add column if not exists role text not null default 'baskan_yardimcisi' check (role in ('baskan', 'baskan_yardimcisi'));
alter table public.admins add column if not exists honorific text not null default 'Bey' check (honorific in ('Bey', 'Hanım'));
alter table public.admins alter column full_name drop default;
alter table public.admins alter column role drop default;
alter table public.admins alter column honorific drop default;

-- Eski kurulumları güncelle: yazılımcı rolü ve yazılımcı için isteğe bağlı hitap
alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check check (role in ('baskan', 'baskan_yardimcisi', 'yazilimci'));
alter table public.admins alter column honorific drop not null;
alter table public.admins drop constraint if exists admins_honorific_check;
alter table public.admins add constraint admins_honorific_check check (honorific in ('Bey', 'Hanım'));
alter table public.admins drop constraint if exists admins_honorific_required;
alter table public.admins add constraint admins_honorific_required check (role = 'yazilimci' or honorific is not null);

-- Ekip sınırı: en fazla bir başkan, iki başkan yardımcısı ve iki yazılımcı
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
  if (select count(*) from public.admins where role = 'yazilimci') > 2 then
    raise exception 'En fazla iki yazılımcı hesabı olabilir.';
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

-- İsteği yapan kişi yazılımcı mı? (Yönetim ekibini düzenleme yetkisi yalnızca ondadır)
create or replace function public.is_developer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and role = 'yazilimci');
$$;

revoke all on function public.is_developer() from public;
grant execute on function public.is_developer() to anon, authenticated;

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
-- Kalıcı silme yalnızca başkanda (ve yazılımcıda)
create policy "basvuru_sil" on public.applications
  for delete to authenticated using (public.is_president() or public.is_developer());

-- Yönetim ekibi: yalnızca paneldeki hesaplar ekibi görebilir (panel adları ve görevleri buradan okur).
-- Panelde olmayan bir hesap hiçbir satır göremez. Yazılımcı hesabı yöneticilere görünmez;
-- onu yalnızca kendisi görür. Ekleme, değiştirme ve silme tablo üzerinden yapılamaz;
-- yalnızca aşağıdaki "Yazılımcı bölümü" fonksiyonlarıyla, yalnızca yazılımcı tarafından yapılır.
drop policy if exists "yonetici_kendini_gor" on public.admins;
drop policy if exists "ekip_ekibi_gorur" on public.admins;
create policy "ekip_ekibi_gorur" on public.admins
  for select to authenticated
  using (public.is_admin() and (role <> 'yazilimci' or user_id = auth.uid() or public.is_developer()));

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

-- =====================================================================
-- Yazılımcı bölümü
--
-- Panelin yalnızca yazılımcıya görünen "Ekip yönetimi" bölümü bu fonksiyonları çağırır.
-- Böylece yöneticiler SQL yazmadan eklenir, düzenlenir, şifreleri sıfırlanır ve kaldırılır.
-- Fonksiyonların hepsi çağıranın yazılımcı olduğunu kendisi denetler.
-- =====================================================================

-- Dışarıya (API'ye) kapalı şema: yardımcı fonksiyonlar ve kurulum ayarları
create schema if not exists nexus_private;
revoke all on schema nexus_private from public, anon, authenticated;

create table if not exists nexus_private.settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- Şifreleri güvenli biçimde özetlemek için (Supabase'de hazır gelir)
do $$
begin
  create extension if not exists pgcrypto with schema extensions;
exception when others then
  null;
end $$;

-- Giriş hesabı açar (e-posta + şifre). Onay e-postası gönderilmez; hesap hemen kullanılabilir.
create or replace function nexus_private.create_account(p_email text, p_password text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id    uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Geçerli bir e-posta adresi yazın.';
  end if;
  if char_length(coalesce(p_password, '')) < 8 then
    raise exception 'Şifre en az 8 karakter olmalı.';
  end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then
    raise exception 'Bu e-postayla bir hesap zaten var.';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf', 10)), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (
    gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now()
  );

  return v_id;
end;
$$;

create or replace function nexus_private.set_password(p_user_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if char_length(coalesce(p_password, '')) < 8 then
    raise exception 'Şifre en az 8 karakter olmalı.';
  end if;
  update auth.users
     set encrypted_password = crypt(p_password, gen_salt('bf', 10)),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         updated_at = now()
   where id = p_user_id;
  if not found then
    raise exception 'Hesap bulunamadı.';
  end if;
end;
$$;

revoke all on function nexus_private.create_account(text, text) from public, anon, authenticated;
revoke all on function nexus_private.set_password(uuid, text) from public, anon, authenticated;

-- Ekip listesi (e-postalarla birlikte). Yalnızca yazılımcı.
create or replace function public.team_list()
returns table (user_id uuid, full_name text, role text, honorific text, email text, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_developer() then
    raise exception 'Bu işlem yalnızca yazılımcıya açıktır.' using errcode = '42501';
  end if;
  return query
    select a.user_id, a.full_name, a.role, a.honorific, u.email::text, u.last_sign_in_at
      from public.admins a
      join auth.users u on u.id = a.user_id
     order by case a.role when 'baskan' then 0 when 'baskan_yardimcisi' then 1 else 2 end, a.created_at;
end;
$$;

-- Yönetici ekler: giriş hesabını açar ve ekibe yazar. Yalnızca yazılımcı.
create or replace function public.team_create(p_email text, p_password text, p_full_name text, p_role text, p_honorific text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_developer() then
    raise exception 'Bu işlem yalnızca yazılımcıya açıktır.' using errcode = '42501';
  end if;
  if p_role not in ('baskan', 'baskan_yardimcisi') then
    raise exception 'Görev başkan ya da başkan yardımcısı olmalı.';
  end if;
  if p_honorific is null or p_honorific not in ('Bey', 'Hanım') then
    raise exception 'Hitap Bey ya da Hanım olmalı.';
  end if;
  if char_length(trim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Ad soyad yazın.';
  end if;

  select u.id into v_id from auth.users u where lower(u.email) = lower(trim(p_email));
  if v_id is not null then
    if exists (select 1 from public.admins a where a.user_id = v_id) then
      raise exception 'Bu e-posta zaten ekipte.';
    end if;
    -- Aynı e-postayla önceden açılmış bir hesap varsa onu kullan, şifresini yenile
    perform nexus_private.set_password(v_id, p_password);
  else
    v_id := nexus_private.create_account(p_email, p_password);
  end if;

  insert into public.admins (user_id, full_name, role, honorific)
  values (v_id, trim(p_full_name), p_role, p_honorific);
  return v_id;
end;
$$;

-- Yöneticinin adını, görevini, hitabını değiştirir. Birini başkan yapmak, mevcut başkanı
-- kendiliğinden başkan yardımcılığına alır (görev değişimi tek adımda olur). Yalnızca yazılımcı.
create or replace function public.team_update(p_user_id uuid, p_full_name text, p_role text, p_honorific text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old text;
  v_name text := trim(coalesce(p_full_name, ''));
begin
  if not public.is_developer() then
    raise exception 'Bu işlem yalnızca yazılımcıya açıktır.' using errcode = '42501';
  end if;
  select a.role into v_old from public.admins a where a.user_id = p_user_id;
  if v_old is null then
    raise exception 'Kişi bulunamadı.';
  end if;
  if char_length(v_name) < 2 then
    raise exception 'Ad soyad yazın.';
  end if;
  if p_honorific is not null and p_honorific not in ('Bey', 'Hanım') then
    raise exception 'Hitap Bey ya da Hanım olmalı.';
  end if;

  if v_old = 'yazilimci' then
    -- Yazılımcının görevi değiştirilemez; adı ve (isteğe bağlı) hitabı değişebilir
    update public.admins set full_name = v_name, honorific = p_honorific where user_id = p_user_id;
    return;
  end if;

  if p_role not in ('baskan', 'baskan_yardimcisi') then
    raise exception 'Görev başkan ya da başkan yardımcısı olmalı.';
  end if;
  if p_honorific is null then
    raise exception 'Hitap Bey ya da Hanım olmalı.';
  end if;

  if p_role = 'baskan' and v_old <> 'baskan' then
    update public.admins a
       set role      = case when a.user_id = p_user_id then 'baskan' when a.role = 'baskan' then 'baskan_yardimcisi' else a.role end,
           full_name = case when a.user_id = p_user_id then v_name else a.full_name end,
           honorific = case when a.user_id = p_user_id then p_honorific else a.honorific end
     where a.role in ('baskan', 'baskan_yardimcisi');
  else
    update public.admins set full_name = v_name, role = p_role, honorific = p_honorific where user_id = p_user_id;
  end if;
end;
$$;

-- Bir ekip üyesinin şifresini yeniler. Yalnızca yazılımcı.
create or replace function public.team_set_password(p_user_id uuid, p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_developer() then
    raise exception 'Bu işlem yalnızca yazılımcıya açıktır.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.admins a where a.user_id = p_user_id) then
    raise exception 'Kişi bulunamadı.';
  end if;
  perform nexus_private.set_password(p_user_id, p_password);
end;
$$;

-- Bir yöneticiyi ekipten çıkarır ve giriş hesabını siler. Yalnızca yazılımcı.
create or replace function public.team_remove(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_developer() then
    raise exception 'Bu işlem yalnızca yazılımcıya açıktır.' using errcode = '42501';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Kendi hesabını kaldıramazsın.';
  end if;
  if not exists (select 1 from public.admins a where a.user_id = p_user_id) then
    raise exception 'Kişi bulunamadı.';
  end if;
  -- Önce panel yetkisini kaldır (bu her koşulda başarılı olur), sonra giriş hesabını silmeyi dene
  delete from public.admins a where a.user_id = p_user_id;
  begin
    delete from auth.users u where u.id = p_user_id;
  exception when others then
    null; -- hesap silinemese de kişi artık panele giremez
  end;
end;
$$;

-- Yazılımcı panele girdiğinde çağrılır. İlk girişi kaydeder (kurulum artık yeni geçici şifre üretmez)
-- ve şifrenin hâlâ kurulumun ürettiği geçici şifre olup olmadığını söyler.
create or replace function public.developer_checkin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_developer() then
    return false;
  end if;
  delete from nexus_private.settings where key = 'developer_first_login_pending';
  -- true: şifre hâlâ geçici (panel şifre değiştirmeyi hatırlatır)
  return exists (select 1 from nexus_private.settings where key = 'developer_temp_password');
end;
$$;

-- Paneldeki herkes kendi şifresini değiştirebilir.
create or replace function public.account_set_password(p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Bu işlem için panele giriş yapmış olmalısın.' using errcode = '42501';
  end if;
  perform nexus_private.set_password(auth.uid(), p_password);
  if public.is_developer() then
    delete from nexus_private.settings where key in ('developer_temp_password', 'developer_first_login_pending');
  end if;
end;
$$;

-- Kurulum durumu (gizli bilgi içermez): yazılımcı hesabı var mı, hesap açma denemesi başarılı mı?
create or replace function public.setup_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'developer_exists', exists (select 1 from public.admins where role = 'yazilimci'),
    'team_size', (select count(*) from public.admins where role <> 'yazilimci'),
    'account_selftest', (select value from nexus_private.settings where key = 'account_selftest')
  );
$$;

revoke all on function public.team_list() from public, anon, authenticated;
revoke all on function public.team_create(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.team_update(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.team_set_password(uuid, text) from public, anon, authenticated;
revoke all on function public.team_remove(uuid) from public, anon, authenticated;
revoke all on function public.developer_checkin() from public, anon, authenticated;
revoke all on function public.account_set_password(text) from public, anon, authenticated;
revoke all on function public.setup_status() from public, anon, authenticated;
grant execute on function public.team_list() to authenticated;
grant execute on function public.team_create(text, text, text, text, text) to authenticated;
grant execute on function public.team_update(uuid, text, text, text) to authenticated;
grant execute on function public.team_set_password(uuid, text) to authenticated;
grant execute on function public.team_remove(uuid) to authenticated;
grant execute on function public.developer_checkin() to authenticated;
grant execute on function public.account_set_password(text) to authenticated;
grant execute on function public.setup_status() to anon, authenticated;

-- API'nin yeni fonksiyonları hemen tanıması için
notify pgrst, 'reload schema';
