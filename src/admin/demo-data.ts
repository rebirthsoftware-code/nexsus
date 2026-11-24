import type { Application, Status } from "./types";

/** Demo modunda gösterilen kurgusal başvurular. Gerçek kişilerle ilgisi yoktur. */
const people: Array<[string, string, string, string[], Status, number, string | null]> = [
  // ad, bölüm, sınıf, ilgi alanları, durum, kaç saat önce, not
  ["Zeynep Kaya", "Psikoloji", "2. Sınıf", ["Söyleşiler", "Yeni insanlarla tanışmak"], "new", 0.4, "Kariyer söyleşilerine özellikle katılmak istiyorum."],
  ["Emir Demir", "Makine Mühendisliği", "3. Sınıf", ["Eğitimler", "Sertifika programları"], "new", 3, null],
  ["Elif Yıldız", "İşletme", "1. Sınıf", ["Sosyal etkinlikler", "Üyelere özel avantajlar"], "new", 9, "Yeni geldim, kampüste insanlarla tanışmak istiyorum."],
  ["Mert Aydın", "Bilgisayar Mühendisliği", "4. Sınıf", ["Atölye çalışmaları", "Eğitimler", "Sertifika programları"], "pending", 27, "Yazılım atölyesi olursa çok iyi olur."],
  ["Defne Arslan", "Mimarlık", "2. Sınıf", ["Atölye çalışmaları", "Sosyal etkinlikler"], "approved", 50, null],
  ["Kerem Şahin", "Hukuk", "Hazırlık", ["Söyleşiler"], "approved", 74, null],
  ["Ada Çelik", "Tıp", "3. Sınıf", ["Yeni insanlarla tanışmak", "Sosyal etkinlikler"], "approved", 98, "Ders dışında farklı bölümlerden arkadaş edinmek istiyorum."],
  ["Yusuf Koç", "Endüstri Mühendisliği", "2. Sınıf", ["Sertifika programları", "Eğitimler"], "approved", 150, null],
  ["Nil Özkan", "Grafik Tasarım", "1. Sınıf", ["Atölye çalışmaları"], "rejected", 200, null],
  ["Baran Polat", "İktisat", "4. Sınıf", ["Sertifika programları", "Üyelere özel avantajlar"], "approved", 260, "Mezun olmadan İŞKUR sertifikasını almak istiyorum."],
];

const extraPeople: Array<[string, string, string, string[]]> = [
  ["Selin Acar", "Hemşirelik", "2. Sınıf", ["Eğitimler", "Sosyal etkinlikler"]],
  ["Onur Güneş", "Elektrik-Elektronik Mühendisliği", "3. Sınıf", ["Atölye çalışmaları", "Sertifika programları"]],
  ["İrem Doğan", "Edebiyat", "1. Sınıf", ["Söyleşiler", "Yeni insanlarla tanışmak"]],
  ["Can Öztürk", "Yazılım Mühendisliği", "2. Sınıf", ["Eğitimler", "Üyelere özel avantajlar"]],
  ["Melis Kurt", "Uluslararası İlişkiler", "Hazırlık", ["Sosyal etkinlikler", "Söyleşiler"]],
];

function contact(name: string, i: number) {
  const slug = name
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, ".");
  return {
    email: `${slug}@ornek.edu.tr`,
    // 0555 000 00 xx: kurgusal numara
    phone: `0555 000 00 ${String(10 + i).padStart(2, "0")}`,
  };
}

export function seedApplications(now = Date.now()): Application[] {
  return people.map(([fullName, department, classYear, attractions, status, hoursAgo, note], i) => ({
    id: `demo-${i + 1}`,
    createdAt: new Date(now - hoursAgo * 3_600_000).toISOString(),
    fullName,
    ...contact(fullName, i),
    department,
    classYear,
    studentNo: i % 3 === 0 ? `20240${1000 + i * 37}` : null,
    attractions,
    note,
    status,
    adminNote: status === "pending" ? "Öğrenci belgesi bekleniyor." : null,
    seen: status !== "new",
  }));
}

export function randomApplication(index: number, now = Date.now()): Application {
  const [fullName, department, classYear, attractions] = extraPeople[index % extraPeople.length];
  return {
    id: `demo-yeni-${now}`,
    createdAt: new Date(now).toISOString(),
    fullName,
    ...contact(fullName, 40 + index),
    department,
    classYear,
    studentNo: null,
    attractions,
    note: null,
    status: "new",
    adminNote: null,
    seen: false,
  };
}
