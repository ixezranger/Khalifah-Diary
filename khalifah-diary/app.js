/* ╔════════════════════════════════════════════════════════════
   Khalifah Diary – app.js
   Prayer Times · Countdown · Hijri Calendar · Hadith · GSAP
   ╔════════════════════════════════════════════════════════════ */

'use strict';

// ═══════════════════════════════════════════
// DATA: MALAYSIA PRAYER TIME ZONES
// ═══════════════════════════════════════════
const ZONES = {
  "Wilayah Persekutuan": [
    { code: "WLY01", name: "Kuala Lumpur, Putrajaya" },
    { code: "WLY02", name: "Labuan" }
  ],
  "Johor": [
    { code: "JHR01", name: "Pulau Aur, Pulau Pemanggil" },
    { code: "JHR02", name: "Johor Bahru, Kluang, Pontian" },
    { code: "JHR03", name: "Batu Pahat, Mersing, Segamat" },
    { code: "JHR04", name: "Muar, Tangkak" }
  ],
  "Kedah": [
    { code: "KDH01", name: "Kota Setar, Kubang Pasu, Pokok Sena" },
    { code: "KDH02", name: "Kuala Muda, Yan, Sik" },
    { code: "KDH03", name: "Kulim, Bandar Baharu" },
    { code: "KDH04", name: "Baling" },
    { code: "KDH05", name: "Padang Terap, Ulu Perak (Kedah)" },
    { code: "KDH06", name: "Langkawi" },
    { code: "KDH07", name: "Puncak Gunung Jerai" }
  ],
  "Kelantan": [
    { code: "KTN01", name: "Kota Bharu, Bachok, Pasir Puteh, Tumpat" },
    { code: "KTN02", name: "Pasir Mas, Tanah Merah, Machang, Kuala Krai, Jeli" },
    { code: "KTN03", name: "Gua Musang (Ulu Kelantan)" }
  ],
  "Melaka": [
    { code: "MLK01", name: "Seluruh Melaka" }
  ],
  "Negeri Sembilan": [
    { code: "NGS01", name: "Jempol, Jelebu" },
    { code: "NGS02", name: "Kuala Pilah, Port Dickson, Seremban, Tampin, Rembau" }
  ],
  "Pahang": [
    { code: "PHG01", name: "Jeram, Kuala Klawang, Sg. Koyan" },
    { code: "PHG02", name: "Rompin, Pekan, Muadzam Shah" },
    { code: "PHG03", name: "Raub" },
    { code: "PHG04", name: "Bentong, Cameron Highlands, Lipis" },
    { code: "PHG05", name: "Temerloh, Maran, Jerantut, Bera" },
    { code: "PHG06", name: "Kuantan, Kemaman" }
  ],
  "Perak": [
    { code: "PRK01", name: "Tapah, Slim River, Tanjung Malim" },
    { code: "PRK02", name: "Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah" },
    { code: "PRK03", name: "Lenggong, Pengkalan Hulu, Grik" },
    { code: "PRK04", name: "Temengor, Belum" },
    { code: "PRK05", name: "Kg. Gajah, Teluk Intan, Bagan Datuk" },
    { code: "PRK06", name: "Selama, Taiping, Bagan Serai, Parit Buntar" },
    { code: "PRK07", name: "Bukit Larut" }
  ],
  "Perlis": [
    { code: "PLS01", name: "Kangar, Padang Besar, Arau" }
  ],
  "Pulau Pinang": [
    { code: "PNG01", name: "Balik Pulau" },
    { code: "PNG02", name: "Seluruh Pulau Pinang" }
  ],
  "Sabah": [
    { code: "SBH01", name: "Kota Kinabalu, Ranau, Tuaran, Penampang" },
    { code: "SBH02", name: "Kudat, Kota Marudu, Pitas" },
    { code: "SBH03", name: "Lahad Datu, Kinabatangan, Sandakan" },
    { code: "SBH04", name: "Semporna, Tawau, Kunak" },
    { code: "SBH05", name: "Keningau, Tambunan, Nabawan" },
    { code: "SBH06", name: "Beaufort, Sipitang, Membakut" },
    { code: "SBH07", name: "Papar" },
    { code: "SBH08", name: "Kota Belud" },
    { code: "SBH09", name: "Kuala Penyu, Menumbok, Weston" }
  ],
  "Sarawak": [
    { code: "SWK01", name: "Limbang, Lawas, Sundar, Trusan" },
    { code: "SWK02", name: "Miri, Niah, Bekenu, Sibuti, Marudi" },
    { code: "SWK03", name: "Pandan, Belaga, Suai" },
    { code: "SWK04", name: "Kanowit, Sibu" },
    { code: "SWK05", name: "Sarikei, Julau, Rajang, Daro, Matu, Igan" },
    { code: "SWK06", name: "Lubok Antu, Sri Aman, Engkelili" },
    { code: "SWK07", name: "Serian, Simunjan, Sanggau, Entikong" },
    { code: "SWK08", name: "Kuching, Bau, Lundu, Sematan" },
    { code: "SWK09", name: "Zon Khas (Sarawak)" }
  ],
  "Selangor": [
    { code: "SGR01", name: "Gombak, Hulu Langat, Sepang, Petaling, Klang" },
    { code: "SGR02", name: "Hulu Selangor, Sabak Bernam" },
    { code: "SGR03", name: "Kuala Selangor, Kelang, Shah Alam" }
  ],
  "Terengganu": [
    { code: "TRG01", name: "Kuala Terengganu, Marang, Kuala Nerus" },
    { code: "TRG02", name: "Besut, Setiu" },
    { code: "TRG03", name: "Hulu Terengganu" },
    { code: "TRG04", name: "Dungun, Kemaman" }
  ]
};

// ═══════════════════════════════════════════
// DATA: HADITH PILIHAN
// ═══════════════════════════════════════════
const HADITHS = [
  {
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٓ مَا نَوَى",
    malay: "Sesungguhnya setiap amalan bergantung kepada niat, dan sesungguhnya setiap orang hanya mendapat apa yang diniatkannya.",
    source: "HR Bukhari & Muslim"
  },
  {
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    malay: "Seorang Muslim adalah orang yang mana orang-orang Muslim lainnya selamat dari lidah dan tangannya.",
    source: "HR Bukhari"
  },
  {
    arabic: "لا يُؤْمِنُ أحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    malay: "Tidak beriman salah seorang dari kalian sehingga ia mencintai saudaranya sebagaimana ia mencintai dirinya sendiri.",
    source: "HR Bukhari & Muslim"
  },
  {
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    malay: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia berkata yang baik atau hendaklah ia diam.",
    source: "HR Bukhari & Muslim"
  },
  {
    arabic: "الدِّينُ النَّصِيحَةُ",
    malay: "Agama itu adalah nasihat — nasihat kepada Allah, kepada kitab-Nya, kepada rasul-Nya, kepada pemimpin kaum muslimin, dan kepada umat Islam seluruhnya.",
    source: "HR Muslim"
  },
  {
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    malay: "Barangsiapa yang berpuasa pada bulan Ramadan dengan penuh keimanan dan mengharap pahala, maka akan diampunkan baginya dosa-dosanya yang telah lalu.",
    source: "HR Bukhari & Muslim"
  },
  {
    arabic: "أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ",
    malay: "Puasa yang paling utama selepas Ramadan adalah puasa pada bulan Allah — Muharram.",
    source: "HR Muslim"
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    malay: "Sebaik-baik kalian adalah orang yang mempelajari Al-Quran dan mengajarkannya.",
    source: "HR Bukhari"
  },
  {
    arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ",
    malay: "Sesungguhnya Allah itu lemah lembut dan menyukai kelembutan dalam segala hal.",
    source: "HR Bukhari & Muslim"
  },
  {
    arabic: "مَا مِنْ أَيَّامٓ الْعَمَلُ الصَّالِحُ فِيهَا أَحَبُّ إِلَى اللَّهِ مِنْ هَذِهِ الأَيَّامِ",
    malay: "Tidak ada hari-hari di mana amalan soleh lebih dicintai Allah melebihi hari-hari ini (sepuluh hari pertama Zulhijjah).",
    source: "HR Bukhari"
  }
];

// ═══════════════════════════════════════════
// DATA: PUBLIC HOLIDAYS MALAYSIA 2026
// source: JPM / official gazette
// ═══════════════════════════════════════════
const publicHolidays2026 = {
  // Applies to ALL states
  national: [
    { date: "2026-02-17", name: "Tahun Baharu Cina" },
    { date: "2026-02-18", name: "Tahun Baharu Cina (Hari Kedua)" },
    { date: "2026-03-21", name: "Hari Raya Puasa" },
    { date: "2026-03-22", name: "Hari Raya Puasa (Hari Kedua)" },
    { date: "2026-05-01", name: "Hari Pekerja" },
    { date: "2026-05-27", name: "Hari Raya Qurban" },
    { date: "2026-05-28", name: "Hari Raya Qurban (Hari Kedua)" },
    { date: "2026-05-31", name: "Hari Wesak" },
    { date: "2026-06-01", name: "Hari Keputeraan YDP Agong" },
    { date: "2026-06-17", name: "Awal Muharam (Maal Hijrah)" },
    { date: "2026-08-25", name: "Maulidur Rasul" },
    { date: "2026-08-31", name: "Hari Kebangsaan" },
    { date: "2026-09-16", name: "Hari Malaysia" },
    { date: "2026-11-08", name: "Hari Deepavali" },
    { date: "2026-12-25", name: "Hari Krismas" },
  ],
  // Keyed by state name – shown only for matching zone
  state: {
    "Wilayah Persekutuan": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-02-01", name: "Hari Wilayah Persekutuan" },
      { date: "2026-02-01", name: "Hari Thaipusam" },
      { date: "2026-03-07", name: "Hari Nuzul Al-Quran" },
    ],
    "Johor": [
      { date: "2026-02-19", name: "Awal Ramadan" },
      { date: "2026-03-23", name: "Hari Keputeraan Sultan Johor" },
      { date: "2026-07-21", name: "Hari Hol Almarhum Sultan Iskandar" },
    ],
    "Kedah": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-02-01", name: "Hari Thaipusam" },
      { date: "2026-02-19", name: "Awal Ramadan" },
      { date: "2026-05-28", name: "Hari Raya Qurban (Hari Kedua)" },
      { date: "2026-06-21", name: "Hari Keputeraan Sultan Kedah" },
    ],
    "Kelantan": [
      { date: "2026-01-17", name: "Israk dan Mikraj" },
      { date: "2026-03-07", name: "Hari Nuzul Al-Quran" },
      { date: "2026-05-26", name: "Hari Arafah" },
      { date: "2026-09-29", name: "Hari Keputeraan Sultan Kelantan" },
      { date: "2026-09-30", name: "Hari Keputeraan Sultan Kelantan (Hari Kedua)" },
    ],
    "Melaka": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-02-01", name: "Hari Thaipusam" },
      { date: "2026-02-20", name: "Hari Pengisytiharan Tarikh Kemerdekaan" },
      { date: "2026-03-23", name: "Hari Raya Puasa (Hari Ketiga)" },
      { date: "2026-08-24", name: "Hari Jadi Yang di-Pertua Negeri Melaka" },
    ],
    "Negeri Sembilan": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-01-14", name: "Hari Keputeraan YDP Besar N. Sembilan" },
      { date: "2026-01-17", name: "Israk dan Mikraj" },
      { date: "2026-02-01", name: "Hari Thaipusam" },
    ],
    "Pahang": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-05-22", name: "Hari Hol Almarhum Sultan Ahmad Shah" },
      { date: "2026-07-31", name: "Hari Keputeraan Sultan Pahang" },
    ],
    "Pulau Pinang": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-02-01", name: "Hari Thaipusam" },
      { date: "2026-07-07", name: "Hari Ulang Tahun Tapak Warisan Dunia" },
      { date: "2026-07-11", name: "Hari Jadi Yang di-Pertua Negeri P.Pinang" },
    ],
    "Perak": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-02-01", name: "Hari Thaipusam" },
      { date: "2026-11-06", name: "Hari Keputeraan Sultan Perak" },
    ],
    "Perlis": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-01-17", name: "Israk dan Mikraj" },
      { date: "2026-03-07", name: "Hari Nuzul Al-Quran" },
      { date: "2026-05-17", name: "Hari Ulang Tahun Keputeraan Raja Perlis" },
      { date: "2026-05-28", name: "Hari Raya Qurban (Hari Kedua)" },
    ],
    "Sabah": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-03-30", name: "Hari Jadi Yang di-Pertua Negeri Sabah" },
      { date: "2026-04-03", name: "Good Friday" },
      { date: "2026-05-30", name: "Pesta Kaamatan" },
      { date: "2026-05-31", name: "Pesta Kaamatan" },
    ],
    "Sarawak": [
      { date: "2026-04-03", name: "Good Friday" },
      { date: "2026-06-01", name: "Perayaan Hari Gawai Dayak" },
      { date: "2026-06-02", name: "Perayaan Hari Gawai Dayak" },
      { date: "2026-07-22", name: "Hari Kemerdekaan Sarawak" },
      { date: "2026-10-10", name: "Hari Jadi Yang di-Pertua Negeri Sarawak" },
      { date: "2026-12-24", name: "Christmas Eve" },
    ],
    "Selangor": [
      { date: "2026-01-01", name: "Tahun Baharu" },
      { date: "2026-02-01", name: "Hari Thaipusam" },
      { date: "2026-03-07", name: "Hari Nuzul Al-Quran" },
      { date: "2026-12-11", name: "Hari Keputeraan Sultan Selangor" },
    ],
    "Terengganu": [
      { date: "2026-01-17", name: "Israk dan Mikraj" },
      { date: "2026-03-04", name: "Hari Ulang Tahun Pertabalan Sultan Terengganu" },
      { date: "2026-03-07", name: "Hari Nuzul Al-Quran" },
      { date: "2026-04-26", name: "Hari Keputeraan Sultan Terengganu" },
      { date: "2026-05-26", name: "Hari Arafah" },
    ],
  }
};

// Maps zone codes to state names for holiday filtering
const ZONE_TO_STATE = {
  WLY01: 'Wilayah Persekutuan', WLY02: 'Wilayah Persekutuan',
  JHR01: 'Johor',   JHR02: 'Johor',   JHR03: 'Johor',   JHR04: 'Johor',
  KDH01: 'Kedah',   KDH02: 'Kedah',   KDH03: 'Kedah',   KDH04: 'Kedah',
  KDH05: 'Kedah',   KDH06: 'Kedah',   KDH07: 'Kedah',
  KTN01: 'Kelantan', KTN02: 'Kelantan', KTN03: 'Kelantan',
  MLK01: 'Melaka',
  NGS01: 'Negeri Sembilan', NGS02: 'Negeri Sembilan',
  PHG01: 'Pahang',  PHG02: 'Pahang',  PHG03: 'Pahang',  PHG04: 'Pahang',
  PHG05: 'Pahang',  PHG06: 'Pahang',
  PRK01: 'Perak',   PRK02: 'Perak',   PRK03: 'Perak',   PRK04: 'Perak',
  PRK05: 'Perak',   PRK06: 'Perak',   PRK07: 'Perak',
  PLS01: 'Perlis',
  PNG01: 'Pulau Pinang', PNG02: 'Pulau Pinang',
  SBH01: 'Sabah',   SBH02: 'Sabah',   SBH03: 'Sabah',   SBH04: 'Sabah',
  SBH05: 'Sabah',   SBH06: 'Sabah',   SBH07: 'Sabah',   SBH08: 'Sabah',   SBH09: 'Sabah',
  SWK01: 'Sarawak', SWK02: 'Sarawak', SWK03: 'Sarawak', SWK04: 'Sarawak',
  SWK05: 'Sarawak', SWK06: 'Sarawak', SWK07: 'Sarawak', SWK08: 'Sarawak', SWK09: 'Sarawak',
  SGR01: 'Selangor', SGR02: 'Selangor', SGR03: 'Selangor',
  TRG01: 'Terengganu', TRG02: 'Terengganu', TRG03: 'Terengganu', TRG04: 'Terengganu',
};

// ═══════════════════════════════════════════
// DATA: MALAY LOCALISATION
// ═══════════════════════════════════════════
const MALAY_MONTHS = ["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"];
const MALAY_DAYS   = ["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"];
const HIJRI_MONTHS = ["Muharram","Safar","Rabiulawal","Rabiulakhir","Jamadilawal","Jamadilakhir","Rejab","Syaaban","Ramadan","Syawal","Zulkaedah","Zulhijjah"];
const HIJRI_DAYS   = ["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"];

const PRAYER_META = [
  { key: "imsak",   label: "Imsak",   arabic: "إِمْسَاك",  icon: "🌙" },
  { key: "fajr",    label: "Subuh",   arabic: "صُبْح",     icon: "🌄" },
  { key: "syuruk",  label: "Syuruk",  arabic: "شُرُوق",    icon: "🌅" },
  { key: "dhuhr",   label: "Zohor",   arabic: "ظُهْر",     icon: "☀️" },
  { key: "asr",     label: "Asar",    arabic: "عَصْر",     icon: "🌤" },
  { key: "maghrib", label: "Maghrib", arabic: "مَغْرِب",   icon: "🌇" },
  { key: "isha",    label: "Isyak",   arabic: "عِشَاء",    icon: "🌌" }
];

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let prayerData = null;
let countdownInterval = null;
let currentHadithIndex = 0;
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
let touchStartX = 0;
let touchStartY = 0;
let currentState = '';

// ═══════════════════════════════════════════
// 12-HOUR TIME FORMAT
// ═══════════════════════════════════════════
function to12Hour(time24) {
  if (!time24 || !time24.includes(':')) return { time: '–', period: '' };
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return { time: `${hour12}:${m}`, period: ampm };
}

// ═══════════════════════════════════════════
// HIJRI DATE CALCULATION
// ═══════════════════════════════════════════
function toHijri(year, month, day) {
  let jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4)
    + Math.floor((367 * (month - 2 - 12 * (Math.floor((month - 14) / 12)))) / 12)
    - Math.floor((3 * (Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100))) / 4)
    + day - 32075;
  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
    + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  let monthH = Math.floor((24 * l) / 709);
  let dayH   = l - Math.floor((709 * monthH) / 24);
  let yearH  = 30 * n + j - 30;
  return { year: yearH, month: monthH, day: dayH };
}

// Malaysia JAKIM rukyah-based Hijri month starts
// [greg_year, greg_month(1-based), greg_day, hijri_year, hijri_month(1-based)]
// Anchored to confirmed official dates; estimated months filled by derivation.
const MY_HIJRI_MONTH_STARTS = [
  [2025,  6, 28, 1447,  1],  // 1 Muharram 1447H
  [2025,  7, 28, 1447,  2],  // 1 Safar 1447H
  [2025,  8, 26, 1447,  3],  // 1 Rabiulawal 1447H
  [2025,  9, 25, 1447,  4],  // 1 Rabiulakhir 1447H
  [2025, 10, 24, 1447,  5],  // 1 Jamadilawal 1447H
  [2025, 11, 23, 1447,  6],  // 1 Jamadilakhir 1447H
  [2025, 12, 22, 1447,  7],  // 1 Rajab 1447H
  [2026,  1, 21, 1447,  8],  // 1 Shaaban 1447H
  [2026,  2, 19, 1447,  9],  // 1 Ramadan 1447H  ← 17 Ramadan = Nuzul Al-Quran Mar 7
  [2026,  3, 21, 1447, 10],  // 1 Syawal 1447H   ← Hari Raya Puasa (confirmed)
  [2026,  4, 19, 1447, 11],  // 1 Zulkaedah 1447H
  [2026,  5, 18, 1447, 12],  // 1 Zulhijjah 1447H ← confirmed (today)
  [2026,  6, 17, 1448,  1],  // 1 Muharram 1448H  ← Awal Muharam (confirmed)
  [2026,  7, 16, 1448,  2],  // 1 Safar 1448H
  [2026,  8, 14, 1448,  3],  // 1 Rabiulawal 1448H ← 12 Rabiulawal = Maulidur Rasul Aug 25
  [2026,  9, 13, 1448,  4],  // 1 Rabiulakhir 1448H
  [2026, 10, 12, 1448,  5],  // 1 Jamadilawal 1448H
  [2026, 11, 11, 1448,  6],  // 1 Jamadilakhir 1448H
  [2026, 12, 10, 1448,  7],  // 1 Rajab 1448H
  [2027,  1,  9, 1448,  8],  // 1 Shaaban 1448H
  [2027,  2,  7, 1448,  9],  // 1 Ramadan 1448H
];

function toHijriMY(date) {
  const ms = date.getTime();
  for (let i = MY_HIJRI_MONTH_STARTS.length - 1; i >= 0; i--) {
    const [sy, sm, sd, hy, hm] = MY_HIJRI_MONTH_STARTS[i];
    const startMs = new Date(sy, sm - 1, sd).getTime();
    if (ms >= startMs) {
      return { year: hy, month: hm, day: Math.round((ms - startMs) / 86400000) + 1 };
    }
  }
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  return toHijri(y, m, d);
}

function hijriDay(date) {
  return toHijriMY(date).day;
}

function hijriMonthName(year, month) {
  const mid = new Date(year, month, 15);
  const h = toHijriMY(mid);
  return `${HIJRI_MONTHS[h.month - 1]} ${h.year} H`;
}

function arabicHijriString(date) {
  const h = toHijriMY(date);
  const dayName = HIJRI_DAYS[date.getDay()];
  const hijriDay   = toArabicNumerals(h.day);
  const hijriMonth = HIJRI_MONTHS[h.month - 1];
  const hijriYear  = toArabicNumerals(h.year);
  return `${dayName}، ${hijriDay} ${hijriMonth} ${hijriYear}`;
}

function toArabicNumerals(n) {
  const arabic = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  return String(n).replace(/[0-9]/g, d => arabic[d]);
}

// ═══════════════════════════════════════════
// CLOCK & DATE DISPLAY
// ═══════════════════════════════════════════
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const clockEl = document.getElementById('heroClock');
  if (clockEl) clockEl.textContent = `${hh}:${mm}:${ss}`;
  const masihiEl = document.getElementById('heroMasihi');
  if (masihiEl) masihiEl.textContent = `${MALAY_DAYS[now.getDay()]}, ${now.getDate()} ${MALAY_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const hijriEl = document.getElementById('heroHijri');
  if (hijriEl) hijriEl.textContent = arabicHijriString(now);
}

// ═══════════════════════════════════════════
// STARS CANVAS
// ═══════════════════════════════════════════
function initStars() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');

  let stars = [];
  const mouse = { x: -999, y: -999 };
  const REPEL = 130, SPRING = 0.04, DAMP = 0.88, LINE = 80;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: 160 }, () => {
      const ox = Math.random() * canvas.width;
      const oy = Math.random() * canvas.height;
      return {
        ox, oy, x: ox, y: oy, vx: 0, vy: 0,
        r: Math.random() * 1.2 + 0.2,
        alpha: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.018 + 0.006
      };
    });
  };

  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; }, { passive: true });

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      s.phase += s.speed;
      s.alpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(s.phase));

      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < REPEL * REPEL && d2 > 0) {
        const d = Math.sqrt(d2);
        const f = (REPEL - d) / REPEL;
        s.vx += (dx / d) * f * 2.8;
        s.vy += (dy / d) * f * 2.8;
      }

      s.vx += (s.ox - s.x) * SPRING;
      s.vy += (s.oy - s.y) * SPRING;
      s.vx *= DAMP;
      s.vy *= DAMP;
      s.x  += s.vx;
      s.y  += s.vy;
    });

    // Connection lines (O(n²) with early dist² guard)
    const LINE2 = LINE * LINE;
    for (let i = 0; i < stars.length - 1; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINE2) {
          const a = (1 - Math.sqrt(d2) / LINE) * 0.13;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(180,210,255,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${s.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize);
  draw();
}

// ═══════════════════════════════════════════
// REGION SELECTOR
// ═══════════════════════════════════════════
function initRegionSelector() {
  const stateSelect = document.getElementById('stateSelect');
  const zoneSelect  = document.getElementById('zoneSelect');

  Object.keys(ZONES).forEach(state => {
    const opt = document.createElement('option');
    opt.value = state; opt.textContent = state;
    stateSelect.appendChild(opt);
  });

  stateSelect.addEventListener('change', () => {
    const state = stateSelect.value;
    zoneSelect.innerHTML = '<option value="">-- Pilih Zon --</option>';
    zoneSelect.disabled = !state;
    if (!state) return;
    ZONES[state].forEach(z => {
      const opt = document.createElement('option');
      opt.value = z.code;
      opt.textContent = `${z.code} – ${z.name}`;
      zoneSelect.appendChild(opt);
    });
  });

  // Load default: KTN02 (Pasir Mas, Kelantan)
  stateSelect.value = "Kelantan";
  stateSelect.dispatchEvent(new Event('change'));
  zoneSelect.value = "KTN02";

  document.getElementById('loadPrayerBtn').addEventListener('click', () => {
    const zone = zoneSelect.value;
    if (!zone) { showToast("Sila pilih zon terlebih dahulu"); return; }
    fetchPrayerTimes(zone);
    setTimeout(() => document.getElementById('solat').scrollIntoView({ behavior: 'smooth' }), 300);
  });
}

// ═══════════════════════════════════════════
// PRAYER TIME API
// Primary source: api.waktusolat.app — a
// CORS-enabled API sourced directly from JAKIM.
// Avoids the stale-cache issues of 3rd-party
// proxies.
//
// Fallback chain:
//   1. api.waktusolat.app/v2/solat/{zone}
//   2. e-solat.gov.my direct (localhost only)
//   3. allorigins CORS proxy (last resort)
//
// api.waktusolat.app v2 response shape:
//   { prayers: [ { day, fajr, syuruk, dhuhr,
//     asr, maghrib, isha, imsak?, hijri, ...} ],
//     zone, month, year, bearing? }
//   - 'prayers' is a monthly array; each entry
//     has a 'day' integer (1-based day of month)
//   - times are "HH:MM:SS" — strip seconds
//   - 'imsak' may be absent in some responses
// Neither path uses eval() or new Function().
// ═══════════════════════════════════════════
const WAKTUSOLAT_API = 'https://api.waktusolat.app/v2/solat/';
const ESOLAT_BASE    = 'https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=';
const CORS_PROXY     = 'https://api.allorigins.win/get?url=';

// Strip the seconds portion from "HH:MM:SS" → "HH:MM".
// Times from api.waktusolat.app include seconds; JAKIM
// direct and the rest of the app expect "HH:MM" only.
function stripSec(t) {
  if (!t) return t;
  const parts = t.split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
}

// Normalise api.waktusolat.app v2 response into the same
// shape as the JAKIM e-solat response so all downstream
// code (renderPrayerCards, parseTime, countdown) is unchanged.
function normaliseWaktuSolatApp(apiData, zone) {
  const todayDay = new Date().getDate();           // 1-based
  const arr      = apiData.prayers;                // correct key
  if (!Array.isArray(arr) || arr.length === 0) return null;

  // Find today's entry by its 'day' value, not by array index,
  // because the array may not start at index 0 == day 1.
  const entry = arr.find(e => Number(e.day) === todayDay);
  if (!entry) return null;

  return {
    bearing:    apiData.bearing || '',
    zone:       zone,
    prayerTime: [{
      imsak:   stripSec(entry.imsak)   || stripSec(entry.fajr), // fallback fajr if absent
      fajr:    stripSec(entry.fajr),
      syuruk:  stripSec(entry.syuruk),
      dhuhr:   stripSec(entry.dhuhr),
      asr:     stripSec(entry.asr),
      maghrib: stripSec(entry.maghrib),
      isha:    stripSec(entry.isha),
      date:    entry.date  || '',
      day:     entry.day   || '',
      hijri:   entry.hijri || ''
    }]
  };
}

async function fetchWithFallback(zone) {
  // Attempt 1: api.waktusolat.app — CORS-enabled, sourced from JAKIM
  try {
    const res = await fetch(WAKTUSOLAT_API + zone);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const apiData    = await res.json();
    const normalised = normaliseWaktuSolatApp(apiData, zone);
    if (normalised?.prayerTime?.[0]) return normalised;
  } catch (_) {
    // Fall through to next source
  }

  const esolatUrl = ESOLAT_BASE + encodeURIComponent(zone);

  // Attempt 2: e-solat.gov.my direct (works on localhost / same-origin)
  try {
    const res = await fetch(esolatUrl, { mode: 'cors' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data?.prayerTime?.[0]) return data;
  } catch (_) {
    // Fall through to proxy
  }

  // Attempt 3: allorigins CORS proxy (last resort)
  const proxyUrl  = CORS_PROXY + encodeURIComponent(esolatUrl);
  const proxyRes  = await fetch(proxyUrl);
  if (!proxyRes.ok) throw new Error('Proxy HTTP ' + proxyRes.status);
  const proxyData = await proxyRes.json();
  const inner     = JSON.parse(proxyData.contents);
  if (!inner?.prayerTime?.[0]) throw new Error('No prayer data in proxy response');
  return inner;
}

async function fetchPrayerTimes(zone) {
  currentState = ZONE_TO_STATE[zone] || '';
  const loading     = document.getElementById('prayerLoading');
  const placeholder = document.getElementById('prayerPlaceholder');

  placeholder.style.display = 'none';
  loading.style.display = 'flex';
  clearPrayerCards();

  try {
    const data = await fetchWithFallback(zone);
    prayerData = data.prayerTime[0];
    loading.style.display = 'none';
    renderPrayerCards(prayerData);

    const bearing = data.bearing || '';
    if (bearing) {
      const info = document.getElementById('bearingInfo');
      document.getElementById('bearingText').textContent = 'Arah Kiblat: ' + bearing;
      info.style.display = 'flex';
    }

    const zoneText = document.getElementById('zoneSelect').selectedOptions[0]?.textContent || zone;
    document.getElementById('solatSubtitle').textContent = zoneText;

    startCountdown();
    renderCalendar(calYear, calMonth, null);
  } catch (err) {
    loading.style.display = 'none';
    placeholder.style.display = 'block';
    const icon = document.createElement('div');
    icon.className = 'placeholder-icon';
    icon.textContent = '⚠️';
    const msg = document.createElement('p');
    msg.textContent = 'Gagal mendapatkan waktu solat. Sila cuba lagi.';
    const detail = document.createElement('small');
    detail.textContent = err.message;
    msg.appendChild(document.createElement('br'));
    msg.appendChild(detail);
    placeholder.innerHTML = '';
    placeholder.appendChild(icon);
    placeholder.appendChild(msg);
  }
}

function clearPrayerCards() {
  document.getElementById('prayerCards').innerHTML = '';
}

function renderPrayerCards(data) {
  const container = document.getElementById('prayerCards');
  const now = new Date();

  const times = PRAYER_META.map(m => ({
    ...m,
    timeDate: parseTime(data[m.key])
  }));

  let nextIdx = -1;
  for (let i = 0; i < times.length; i++) {
    if (times[i].timeDate > now) { nextIdx = i; break; }
  }
  PRAYER_META.forEach((meta, idx) => {
    const card = document.createElement('div');
    card.className = 'prayer-card';
    if (nextIdx !== -1 && idx === nextIdx) card.classList.add('active');
    if (nextIdx !== -1 && idx < nextIdx) card.classList.add('past');
    const badge = idx === nextIdx ? '<div class="prayer-badge">Seterusnya</div>' : '';
    const t12 = to12Hour(data[meta.key]);
    const timeHTML = t12.period ? `${t12.time}<span class="prayer-ampm">${t12.period}</span>` : t12.time;
    card.innerHTML = `${badge}<span class="prayer-icon">${meta.icon}</span><div class="prayer-name-arabic">${meta.arabic}</div><div class="prayer-name">${meta.label}</div><div class="prayer-time">${timeHTML}</div>`;
    container.appendChild(card);
  });
  document.getElementById('countdownWrap').style.display = 'block';
}

function parseTime(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0); return d;
}

// ═══════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════
function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(updateCountdown, 1000);
  updateCountdown();
}

function updateCountdown() {
  if (!prayerData) return;
  const now = new Date();
  const times = PRAYER_META.map(m => ({ ...m, t: parseTime(prayerData[m.key]) }));
  let nextEntry = times.find(t => t.t && t.t > now);
  if (!nextEntry) {
    nextEntry = times[1];
    nextEntry.t = new Date(nextEntry.t.getTime() + 86400000);
  }
  const diff = nextEntry.t - now;
  const totalMs = (() => {
    const prevTimes = times.filter(t => t.t && t.t <= now);
    if (prevTimes.length === 0) return nextEntry.t - new Date(now.setHours(0,0,0,0));
    return nextEntry.t - prevTimes[prevTimes.length - 1].t;
  })();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cdHours').textContent   = String(h).padStart(2,'0');
  document.getElementById('cdMinutes').textContent = String(m).padStart(2,'0');
  document.getElementById('cdSeconds').textContent = String(s).padStart(2,'0');
  const nextTime12 = to12Hour(prayerData[nextEntry.key]);
  const cdTimeStr = nextTime12.period ? ` · ${nextTime12.time} <span class="cd-ampm">${nextTime12.period}</span>` : '';
  document.getElementById('countdownName').innerHTML = `${nextEntry.arabic} ${nextEntry.label}${cdTimeStr}`;

  const pct = Math.max(0, Math.min(100, 100 - (diff / totalMs) * 100));
  document.getElementById('progressBar').style.width = `${pct}%`;
}

// ═══════════════════════════════════════════
// HADITH CAROUSEL
// ═══════════════════════════════════════════
function initHadith() {
  const track = document.getElementById('hadithTrack');
  const dots  = document.getElementById('hadithDots');
  HADITHS.forEach((h, i) => {
    const card = document.createElement('div');
    card.className = 'hadith-card glass-card' + (i === 0 ? ' active' : '');
    card.innerHTML = `<p class="hadith-arabic">"${h.arabic}"</p><div class="hadith-divider"></div><p class="hadith-malay">${h.malay}</p><span class="hadith-source">${h.source}</span>`;
    track.appendChild(card);
    const dot = document.createElement('div');
    dot.className = 'hadith-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => showHadith(i));
    dots.appendChild(dot);
  });
  document.getElementById('hadithPrev').addEventListener('click', () => showHadith((currentHadithIndex - 1 + HADITHS.length) % HADITHS.length, 'right'));
  document.getElementById('hadithNext').addEventListener('click', () => showHadith((currentHadithIndex + 1) % HADITHS.length, 'left'));
  setInterval(() => showHadith((currentHadithIndex + 1) % HADITHS.length, 'left'), 8000);
  const section = document.getElementById('hadith');
  section.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  section.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) showHadith((currentHadithIndex + (dx < 0 ? 1 : -1) + HADITHS.length) % HADITHS.length, dx < 0 ? 'left' : 'right');
  });
}

function showHadith(idx, dir = 'left') {
  const cards = document.querySelectorAll('.hadith-card');
  const dots  = document.querySelectorAll('.hadith-dot');
  cards[currentHadithIndex].classList.remove('active');
  cards[currentHadithIndex].classList.add(dir === 'left' ? 'exit-left' : '');
  setTimeout(() => cards[currentHadithIndex].classList.remove('exit-left'), 600);
  dots[currentHadithIndex].classList.remove('active');
  currentHadithIndex = idx;
  cards[currentHadithIndex].style.transform = dir === 'left' ? 'translateX(60px)' : 'translateX(-60px)';
  setTimeout(() => { cards[currentHadithIndex].style.transform = ''; cards[currentHadithIndex].classList.add('active'); }, 20);
  dots[currentHadithIndex].classList.add('active');
}

// ═══════════════════════════════════════════
// CALENDAR MODULE
// ═══════════════════════════════════════════
function getHolidaysForDate(dateStr) {
  const national = publicHolidays2026.national.filter(h => h.date === dateStr);
  const state = currentState && publicHolidays2026.state[currentState]
    ? publicHolidays2026.state[currentState].filter(h => h.date === dateStr)
    : [];
  return { national, state };
}

function pad2(n) { return String(n).padStart(2,'0'); }

function renderCalendar(year, month, direction) {
  const body  = document.getElementById('calBody');
  document.getElementById('calMonthName').textContent = `${MALAY_MONTHS[month]} ${year}`;
  document.getElementById('calHijriMonth').textContent = hijriMonthName(year, month);
  body.innerHTML = '';
  if (direction) {
    body.classList.remove('slide-left', 'slide-right');
    void body.offsetWidth;
    body.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');
  }
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day other-month empty';
    cell.innerHTML = `<span class="day-num">${prevDays - firstDay + i + 1}</span>`;
    body.appendChild(cell);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad2(month+1)}-${pad2(d)}`;
    const dateObj = new Date(year, month, d);
    const isToday = (dateObj.toDateString() === today.toDateString());
    const isFri   = (dateObj.getDay() === 5);
    const { national: natHols, state: stateHols } = getHolidaysForDate(dateStr);
    const hasNat = natHols.length > 0;
    const hasSt  = stateHols.length > 0;
    const hasAny = hasNat || hasSt;

    const cell = document.createElement('div');
    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (isFri)   cls += ' friday';
    if (hasNat)  cls += ' national-holiday';
    if (hasSt)   cls += ' state-holiday';
    cell.className = cls;
    const hDay = hijriDay(dateObj);
    const dots = [
      hasNat ? '<span class="day-dot national"></span>' : '',
      hasSt  ? '<span class="day-dot state-h"></span>'  : '',
    ].join('');
    const dotHTML = hasAny ? `<div class="day-dots">${dots}</div>` : '';

    const labels = [...natHols.map(h => h.name), ...stateHols.map(h => h.name)];
    const labelHTML = hasAny
      ? `<span class="day-holiday-label">${labels[0]}${labels.length > 1 ? ` +${labels.length - 1}` : ''}</span>`
      : '';

    cell.innerHTML = `
      <span class="day-num">${d}</span>
      <span class="day-hijri">${hDay}</span>
      ${dotHTML}
      ${labelHTML}
    `;

    if (hasAny) {
      cell.addEventListener('click', () => showHolidayPopup(dateStr, d, natHols, stateHols));
    }

    body.appendChild(cell);
  }
  const total = firstDay + daysInMonth;
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= trailing; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day other-month empty';
    cell.innerHTML = `<span class="day-num">${d}</span>`;
    body.appendChild(cell);
  }
}

function showHolidayPopup(dateStr, day, natHols, stateHols) {
  const popup   = document.getElementById('holidayPopup');
  const content = document.getElementById('popupContent');
  const [yr, mo] = dateStr.split('-').map(Number);
  const dateDisp = `${day} ${MALAY_MONTHS[mo-1]} ${yr}`;

  let html = `<span class="popup-date">${dateDisp}</span>`;
  natHols.forEach(h => {
    html += `<strong class="popup-holiday-name national">${h.name}</strong>`;
  });
  stateHols.forEach(h => {
    html += `<strong class="popup-holiday-name state">${h.name}</strong>`;
  });

  content.innerHTML = html;
  popup.style.display = 'block';
}

function initCalendar() {
  renderCalendar(calYear, calMonth, null);
  document.getElementById('calPrev').addEventListener('click', () => {
    if (calMonth === 0) { calMonth = 11; calYear--; } else calMonth--;
    renderCalendar(calYear, calMonth, 'prev');
  });
  document.getElementById('calNext').addEventListener('click', () => {
    if (calMonth === 11) { calMonth = 0; calYear++; } else calMonth++;
    renderCalendar(calYear, calMonth, 'next');
  });
  const calWrap = document.querySelector('.calendar-wrapper');
  let calTouchX = 0, calTouchY = 0;
  calWrap.addEventListener('touchstart', e => { calTouchX = e.touches[0].clientX; calTouchY = e.touches[0].clientY; }, { passive: true });
  calWrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - calTouchX;
    const dy = e.changedTouches[0].clientY - calTouchY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) { if (calMonth === 11) { calMonth = 0; calYear++; } else calMonth++; renderCalendar(calYear, calMonth, 'next'); }
      else        { if (calMonth === 0)  { calMonth = 11; calYear--; } else calMonth--; renderCalendar(calYear, calMonth, 'prev'); }
    }
  });
  document.getElementById('popupClose').addEventListener('click', () => { document.getElementById('holidayPopup').style.display = 'none'; });
}

// ═══════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
  document.getElementById('navMenuBtn').addEventListener('click', () => document.getElementById('navMobile').classList.toggle('open'));
  document.querySelectorAll('.nav-mobile .nav-link').forEach(link => link.addEventListener('click', () => document.getElementById('navMobile').classList.remove('open')));
}

// ═══════════════════════════════════════════
// GSAP ANIMATIONS
// ═══════════════════════════════════════════
function initGSAP() {
  if (!window.gsap) return;
  // Hero entrance animations only – no ScrollTrigger (avoids CSP eval() errors)
  gsap.to('#heroDateBlock',   { opacity: 1, y: 0, duration: 0.8, delay: 0.3,  ease: "power3.out" });
  gsap.to('.hero-title',      { opacity: 1, y: 0, duration: 0.9, delay: 0.55, ease: "power3.out" });
  gsap.to('.hero-subtitle',   { opacity: 1,       duration: 0.7, delay: 0.8,  ease: "power2.out" });
  gsap.to('.region-selector', { opacity: 1, y: 0, duration: 0.7, delay: 1,    ease: "power3.out" });
}

// Section reveals via IntersectionObserver (CSP-safe, replaces ScrollTrigger)
function initRevealObserver() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════
// BACKGROUND PARTICLES (pure Canvas, CSP-safe)
// ═══════════════════════════════════════════
function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particlesCanvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.insertAdjacentElement('afterbegin', canvas);

  const ctx = canvas.getContext('2d');
  // Hardcoded to match --accent, --accent2, --gold CSS vars
  const COLS = ['46,168,213', '56,217,169', '244,197,66'];
  const COUNT = 60;
  const mouse = { x: -9999, y: -9999 };
  let particles = [];

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const mkParticle = (scattered) => {
    const x = Math.random() * canvas.width;
    const y = scattered ? Math.random() * canvas.height : canvas.height + Math.random() * 80;
    return {
      x, y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.6 + 0.2),
      r:  Math.random() * 2.2 + 0.4,
      alpha: Math.random() * 0.45 + 0.15,
      col: COLS[Math.floor(Math.random() * COLS.length)]
    };
  };

  resize();
  particles = Array.from({ length: COUNT }, () => mkParticle(true));

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('touchmove',  e => {
    if (e.touches[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
  }, { passive: true });
  window.addEventListener('touchend', () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });
  window.addEventListener('resize', resize);

  const ATTRACT = 180;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < ATTRACT * ATTRACT && d2 > 0) {
        const d = Math.sqrt(d2);
        const f = (ATTRACT - d) / ATTRACT * 0.018;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx *= 0.97;
      p.vy  = Math.min(p.vy * 0.98, -0.08);
      p.x  += p.vx;
      p.y  += p.vy;
      if (p.x < -5) p.x = canvas.width + 5;
      if (p.x > canvas.width + 5) p.x = -5;
      if (p.y < -10) particles[i] = mkParticle(false);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.col},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
}

// ═══════════════════════════════════════════
// RIPPLE EFFECT (JS-driven, pure CSS anim)
// ═══════════════════════════════════════════
function spawnRipple(el, clientX, clientY) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.cssText = `width:${size}px;height:${size}px;left:${clientX - rect.left - size / 2}px;top:${clientY - rect.top - size / 2}px;`;
  el.appendChild(span);
  setTimeout(() => span.remove(), 700);
}

function initRipple() {
  // Static elements known at init time
  document.querySelectorAll('.btn-primary, .hadith-btn, .cal-nav-btn').forEach(el => {
    el.addEventListener('click', e => spawnRipple(el, e.clientX, e.clientY));
  });
  // Delegated for dynamically-created cards and calendar days
  document.addEventListener('click', e => {
    const host = e.target.closest('.prayer-card, .cal-day:not(.empty)');
    if (host) spawnRipple(host, e.clientX, e.clientY);
  });
}

// ═══════════════════════════════════════════
// SECTION TITLE LETTER-BY-LETTER ANIMATION
// ═══════════════════════════════════════════
function initLetterSplits() {
  document.querySelectorAll('.section-title').forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split('').map((ch, i) =>
      `<span class="char" style="transition-delay:${i * 0.045}s">${ch === ' ' ? '&nbsp;' : ch}</span>`
    ).join('');
  });
  gsap.to('.hadith-section', { backgroundPositionY: '30%', ease: "none", scrollTrigger: { trigger: '.hadith-section', start: 'top bottom', end: 'bottom top', scrub: true } });
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    Object.assign(toast.style, { position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(30,50,90,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', color: '#e8f0fe', padding: '12px 24px', borderRadius: '30px', fontSize: '0.88rem', zIndex: '9999', fontFamily: 'Inter,sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', transition: 'opacity 0.3s ease' });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initLetterSplits();
  initStars();
  initNavbar();
  initRegionSelector();
  initHadith();
  initCalendar();
  updateClock();
  setInterval(updateClock, 1000);
  initRevealObserver();
  initRipple();

  if (window.gsap) {
    initGSAP();
  } else {
    window.addEventListener('load', initGSAP);
  }

  // Auto-load default zone: KTN02 – Pasir Mas, Kelantan
  setTimeout(() => {
    fetchPrayerTimes('KTN02');
  }, 600);
});
