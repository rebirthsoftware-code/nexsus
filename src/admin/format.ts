import type { Application } from "./types";
import { statusMeta } from "./types";

const rtf = new Intl.RelativeTimeFormat("tr", { numeric: "auto" });

/** "3 saat önce", "dün" gibi göreli zaman */
export function timeAgo(iso: string, now = Date.now()) {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "az önce";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86_400 * 30) return rtf.format(Math.round(diff / 86_400), "day");
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function fullDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** Yerel gün anahtarı: "2026-11-24" */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 05xx xxx xx xx → WhatsApp bağlantısı */
export function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^90/, "").replace(/^0/, "");
  return `https://wa.me/90${digits}`;
}

const palette = ["bg-brand text-paper", "bg-coral text-ink", "bg-lime text-ink", "bg-lilac text-ink", "bg-sun text-ink", "bg-navy text-paper"];

/** İsme göre sabit bir avatar rengi */
export function avatarTone(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

/** Excel'in Türkçe ayarlarıyla doğrudan açılan CSV (noktalı virgül ayraçlı, UTF-8 BOM'lu) */
export function toCsv(list: Application[]) {
  const head = ["Tarih", "Ad Soyad", "Bölüm", "Sınıf", "Öğrenci No", "E-posta", "Telefon", "İlgi Alanları", "Not", "Durum", "Yönetici Notu"];
  const cell = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = list.map((a) =>
    [fullDate(a.createdAt), a.fullName, a.department, a.classYear, a.studentNo, a.email, a.phone, a.attractions.join(", "), a.note, statusMeta[a.status].label, a.adminNote].map(cell).join(";")
  );
  return `﻿${head.map(cell).join(";")}\r\n${rows.join("\r\n")}`;
}

export function downloadFile(name: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
