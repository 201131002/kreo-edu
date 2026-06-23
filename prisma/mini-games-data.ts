export type SeedQuestion = {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
};

export type SeedMiniGame = {
  classId: string;
  title: string;
  description: string;
  materialId: string;
  materialTitle: string;
  materialContent: string;
  quizId: string;
  quizTitle: string;
  rewardCoins: number;
  rewardExp: number;
  questions: SeedQuestion[];
};

export const MINI_GAMES: SeedMiniGame[] = [
  {
    classId: "seed-kelas-history-heroes",
    title: "History Heroes",
    description: "Jelajahi sejarah Indonesia lewat petualangan epik!",
    materialId: "seed-materi-history-heroes",
    materialTitle: "Pahlawan & Sejarah Indonesia",
    materialContent: `Selamat datang di History Heroes! Kamu akan menjadi penjelajah waktu yang mempelajari perjuangan bangsa Indonesia.

📜 Proklamasi Kemerdekaan
Indonesia memproklamasikan kemerdekaannya pada 17 Agustus 1945. Bung Karno (Soekarno) dan Bung Hatta membacakan teks proklamasi di Jalan Pegangsaan Timur No. 56, Jakarta.

⚔️ Pahlawan Nasional
- Cut Nyak Dien: Pahlawan dari Aceh yang melawan Belanda.
- Diponegoro: Pangeran yang memimpin Perang Jawa (1825–1830).
- Kartini: Pelopor emansipasi wanita dan pendidikan.
- Soekarno & Hatta: Proklamator kemerdekaan Indonesia.

🏛️ Kerajaan Nusantara
Majapahit dan Sriwijaya adalah kerajaan besar yang pernah berjaya di Nusantara. Kerajaan Majapahit dikenal dengan slogan "Nagara Kertagama" dan legenda Gajah Mada.

Kumpulkan EXP dengan menyelesaikan kuis 10 soal di bawah ini!`,
    quizId: "seed-kuis-history-heroes",
    quizTitle: "Kuis Epik: History Heroes",
    rewardCoins: 25,
    rewardExp: 120,
    questions: [
      {
        id: "seed-hh-q1",
        questionText: "Kapan Indonesia memproklamasikan kemerdekaannya?",
        optionA: "17 Agustus 1945",
        optionB: "10 November 1945",
        optionC: "1 Juni 1945",
        optionD: "28 Oktober 1928",
        correctOption: "A",
      },
      {
        id: "seed-hh-q2",
        questionText: "Siapa yang membacakan teks proklamasi bersama Bung Karno?",
        optionA: "Cut Nyak Dien",
        optionB: "Mohammad Hatta",
        optionC: "Diponegoro",
        optionD: "Kartini",
        correctOption: "B",
      },
      {
        id: "seed-hh-q3",
        questionText: "Pahlawan wanita dari Aceh yang melawan Belanda adalah...",
        optionA: "Kartini",
        optionB: "Cut Nyak Dien",
        optionC: "Fatmawati",
        optionD: "RA Kartini",
        correctOption: "B",
      },
      {
        id: "seed-hh-q4",
        questionText: "Kerajaan besar di Nusantara yang terkenal dengan Gajah Mada adalah...",
        optionA: "Sriwijaya",
        optionB: "Majapahit",
        optionC: "Mataram",
        optionD: "Demak",
        correctOption: "B",
      },
      {
        id: "seed-hh-q5",
        questionText: "Bung Karno adalah nama panggilan untuk...",
        optionA: "Mohammad Hatta",
        optionB: "Soekarno",
        optionC: "Diponegoro",
        optionD: "Sultan Hasanuddin",
        correctOption: "B",
      },
      {
        id: "seed-hh-q6",
        questionText: "Perang Diponegoro terjadi pada tahun...",
        optionA: "1600–1625",
        optionB: "1825–1830",
        optionC: "1945–1949",
        optionD: "1908–1912",
        correctOption: "B",
      },
      {
        id: "seed-hh-q7",
        questionText: "Kartini dikenal sebagai pelopor...",
        optionA: "Kemerdekaan Indonesia",
        optionB: "Emansipasi wanita & pendidikan",
        optionC: "Perdagangan rempah",
        optionD: "Penemuan kapal",
        correctOption: "B",
      },
      {
        id: "seed-hh-q8",
        questionText: "Bendera Indonesia berwarna...",
        optionA: "Merah putih",
        optionB: "Merah kuning",
        optionC: "Biru putih",
        optionD: "Hijau kuning",
        correctOption: "A",
      },
      {
        id: "seed-hh-q9",
        questionText: "Kerajaan Sriwijaya terkenal sebagai pusat...",
        optionA: "Pertanian",
        optionB: "Perdagangan & maritim",
        optionC: "Teknologi",
        optionD: "Seni lukis",
        correctOption: "B",
      },
      {
        id: "seed-hh-q10",
        questionText: "Sumpah Pemuda dilaksanakan pada tahun...",
        optionA: "1908",
        optionB: "1928",
        optionC: "1945",
        optionD: "1949",
        correctOption: "B",
      },
    ],
  },
  {
    classId: "seed-kelas-language-war",
    title: "Language War",
    description: "Kuasai bahasa Indonesia dan Inggris dengan tantangan seru!",
    materialId: "seed-materi-language-war",
    materialTitle: "Senjata Bahasa: Indonesia & Inggris",
    materialContent: `Selamat datang di Language War! Kuasai dua bahasa sekaligus dan jadilah jawara komunikasi.

🇮🇩 Bahasa Indonesia
- Kata sapaan: selamat pagi, selamat siang, terima kasih, maaf
- Kata tanya: apa (what), siapa (who), kapan (when), di mana (where)
- Kalimat sederhana: "Saya suka belajar" = "I like to study"

🇬🇧 Bahasa Inggris Dasar
- Greetings: Good morning, Good afternoon, Thank you, Sorry
- Numbers: one (1), two (2), three (3), ten (10), twenty (20)
- Colors: red (merah), blue (biru), green (hijau), yellow (kuning)

💡 Tips Petarung Bahasa
Perhatikan arti kata dalam konteks kalimat. Banyak kata Indonesia dan Inggris mirip, seperti "hotel" dan "telepon"!

Selesaikan 10 soal untuk menguji kemampuanmu!`,
    quizId: "seed-kuis-language-war",
    quizTitle: "Kuis Seru: Language War",
    rewardCoins: 25,
    rewardExp: 120,
    questions: [
      {
        id: "seed-lw-q1",
        questionText: 'Apa arti "Thank you" dalam Bahasa Indonesia?',
        optionA: "Selamat pagi",
        optionB: "Terima kasih",
        optionC: "Maaf",
        optionD: "Sampai jumpa",
        correctOption: "B",
      },
      {
        id: "seed-lw-q2",
        questionText: 'Kata "apple" dalam Bahasa Indonesia adalah...',
        optionA: "Jeruk",
        optionB: "Apel",
        optionC: "Mangga",
        optionD: "Pisang",
        correctOption: "B",
      },
      {
        id: "seed-lw-q3",
        questionText: 'Bagaimana mengucapkan "Selamat pagi" dalam Bahasa Inggris?',
        optionA: "Good night",
        optionB: "Good afternoon",
        optionC: "Good morning",
        optionD: "Good evening",
        correctOption: "C",
      },
      {
        id: "seed-lw-q4",
        questionText: 'Angka "seven" dalam Bahasa Indonesia adalah...',
        optionA: "Lima",
        optionB: "Enam",
        optionC: "Tujuh",
        optionD: "Delapan",
        correctOption: "C",
      },
      {
        id: "seed-lw-q5",
        questionText: 'Apa arti kata "book"?',
        optionA: "Buku",
        optionB: "Pena",
        optionC: "Meja",
        optionD: "Kursi",
        correctOption: "A",
      },
      {
        id: "seed-lw-q6",
        questionText: 'Kata "red" berarti warna...',
        optionA: "Biru",
        optionB: "Hijau",
        optionC: "Merah",
        optionD: "Kuning",
        correctOption: "C",
      },
      {
        id: "seed-lw-q7",
        questionText: 'Kalimat "I am a student" artinya...',
        optionA: "Saya seorang guru",
        optionB: "Saya seorang siswa",
        optionC: "Saya seorang dokter",
        optionD: "Saya seorang petani",
        correctOption: "B",
      },
      {
        id: "seed-lw-q8",
        questionText: 'Kata tanya "What" artinya...',
        optionA: "Siapa",
        optionB: "Kapan",
        optionC: "Apa",
        optionD: "Di mana",
        correctOption: "C",
      },
      {
        id: "seed-lw-q9",
        questionText: 'Kata "cat" dalam Bahasa Indonesia adalah...',
        optionA: "Anjing",
        optionB: "Kucing",
        optionC: "Burung",
        optionD: "Ikan",
        correctOption: "B",
      },
      {
        id: "seed-lw-q10",
        questionText: 'Apa arti "Goodbye"?',
        optionA: "Halo",
        optionB: "Selamat tinggal",
        optionC: "Terima kasih",
        optionD: "Permisi",
        correctOption: "B",
      },
    ],
  },
  {
    classId: "seed-kelas-questopia",
    title: "Questopia",
    description: "Petualangan terbuka penuh misi dan hadiah menarik!",
    materialId: "seed-materi-questopia",
    materialTitle: "Peta Misi Questopia",
    materialContent: `Selamat datang di Questopia — dunia petualangan tanpa batas!

🗺️ Cara Bermain
Setiap misi adalah pelajaran baru. Selesaikan kuis untuk membuka hadiah EXP dan koin. Semakin banyak misi diselesaikan, semakin tinggi levelmu!

🎯 Misi Utama
1. Jelajahi pengetahuan umum tentang alam dan lingkungan
2. Pahami pentingnya menjaga kebersihan dan kesehatan
3. Kenali profesi dan peran masyarakat di sekitarmu
4. Latih kemampuan berpikir kritis dengan soal cerita

🏆 Hadiah Spesial
Questopia memberikan hadiah lebih besar karena setiap misi menantang! Kumpulkan koin untuk membeli item di Toko Reward.

Siap menerima 10 misi seru? Ayo mulai petualanganmu!`,
    quizId: "seed-kuis-questopia",
    quizTitle: "Misi Utama: Questopia",
    rewardCoins: 30,
    rewardExp: 150,
    questions: [
      {
        id: "seed-qo-q1",
        questionText: "Planet yang kita tinggali disebut...",
        optionA: "Mars",
        optionB: "Bumi",
        optionC: "Venus",
        optionD: "Jupiter",
        correctOption: "B",
      },
      {
        id: "seed-qo-q2",
        questionText: "Air sangat penting bagi makhluk hidup karena...",
        optionA: "Membuat bunyi",
        optionB: "Menghidupkan dan menjaga tubuh",
        optionC: "Membuat warna",
        optionD: "Menghilangkan cahaya",
        correctOption: "B",
      },
      {
        id: "seed-qo-q3",
        questionText: "Dokter bertugas untuk...",
        optionA: "Memasak makanan",
        optionB: "Mengajar di sekolah",
        optionC: "Mengobati orang sakit",
        optionD: "Menjahit pakaian",
        correctOption: "C",
      },
      {
        id: "seed-qo-q4",
        questionText: "Sampah plastik sebaiknya...",
        optionA: "Dibakar sembarangan",
        optionB: "Dibuang ke sungai",
        optionC: "Dikumpulkan dan didaur ulang",
        optionD: "Ditanam di halaman",
        correctOption: "C",
      },
      {
        id: "seed-qo-q5",
        questionText: "Hewan yang bernapas dengan insang adalah...",
        optionA: "Kucing",
        optionB: "Burung",
        optionC: "Ikan",
        optionD: "Ayam",
        correctOption: "C",
      },
      {
        id: "seed-qo-q6",
        questionText: "Cara menjaga kesehatan yang baik adalah...",
        optionA: "Tidur larut malam setiap hari",
        optionB: "Makan makanan bergizi & olahraga",
        optionC: "Jarang minum air",
        optionD: "Tidak pernah mandi",
        correctOption: "B",
      },
      {
        id: "seed-qo-q7",
        questionText: "Petani bertugas untuk...",
        optionA: "Menanam dan menyiapkan pangan",
        optionB: "Menerbangkan pesawat",
        optionC: "Memadamkan api",
        optionD: "Membuat film",
        correctOption: "A",
      },
      {
        id: "seed-qo-q8",
        questionText: "Pohon berguna untuk lingkungan karena...",
        optionA: "Menghasilkan oksigen",
        optionB: "Membuat polusi",
        optionC: "Menghabiskan air",
        optionD: "Menghilangkan hewan",
        correctOption: "A",
      },
      {
        id: "seed-qo-q9",
        questionText: "Andi punya 5 permen, diberi 3 lagi. Total permen Andi...",
        optionA: "6",
        optionB: "7",
        optionC: "8",
        optionD: "9",
        correctOption: "C",
      },
      {
        id: "seed-qo-q10",
        questionText: "Kita harus menolong teman yang kesulitan karena...",
        optionA: "Agar dapat hadiah",
        optionB: "Itu perilaku baik dan peduli",
        optionC: "Agar dipuji guru saja",
        optionD: "Agar tidak sekolah",
        correctOption: "B",
      },
    ],
  },
  {
    classId: "seed-kelas-math-master",
    title: "Math Master",
    description: "Jadi juara matematika dengan kuis interaktif!",
    materialId: "seed-materi-math-master",
    materialTitle: "Rumus Juara Math Master",
    materialContent: `Selamat datang di Math Master! Matematika itu menyenangkan kalau kamu tahu triknya.

➕ Penjumlahan
Menambah angka berarti menggabungkan jumlah. Contoh: 7 + 5 = 12

➖ Pengurangan
Mengurangi berarti mengambil sebagian. Contoh: 15 − 8 = 7

✖️ Perkalian
Perkalian adalah penjumlahan berulang. Contoh: 4 × 3 = 4 + 4 + 4 = 12

➗ Pembagian
Membagi sama rata. Contoh: 12 ÷ 3 = 4

📐 Tips Juara
- Baca soal dengan teliti
- Gunakan jari atau gambar jika perlu
- Cek ulang jawaban sebelum selesai

Tantang dirimu dengan 10 soal matematika seru!`,
    quizId: "seed-kuis-math-master",
    quizTitle: "Kuis Juara: Math Master",
    rewardCoins: 20,
    rewardExp: 100,
    questions: [
      {
        id: "seed-mm-q1",
        questionText: "Berapakah hasil dari 8 + 7?",
        optionA: "13",
        optionB: "14",
        optionC: "15",
        optionD: "16",
        correctOption: "C",
      },
      {
        id: "seed-mm-q2",
        questionText: "Berapakah hasil dari 20 − 9?",
        optionA: "10",
        optionB: "11",
        optionC: "12",
        optionD: "13",
        correctOption: "B",
      },
      {
        id: "seed-mm-q3",
        questionText: "Berapakah hasil dari 6 × 4?",
        optionA: "20",
        optionB: "22",
        optionC: "24",
        optionD: "26",
        correctOption: "C",
      },
      {
        id: "seed-mm-q4",
        questionText: "Berapakah hasil dari 18 ÷ 3?",
        optionA: "4",
        optionB: "5",
        optionC: "6",
        optionD: "7",
        correctOption: "C",
      },
      {
        id: "seed-mm-q5",
        questionText: "Angka genap di bawah ini adalah...",
        optionA: "7",
        optionB: "9",
        optionC: "12",
        optionD: "15",
        correctOption: "C",
      },
      {
        id: "seed-mm-q6",
        questionText: "Berapakah hasil dari 25 + 15?",
        optionA: "35",
        optionB: "40",
        optionC: "45",
        optionD: "50",
        correctOption: "B",
      },
      {
        id: "seed-mm-q7",
        questionText: "Berapakah hasil dari 5 × 5?",
        optionA: "20",
        optionB: "25",
        optionC: "30",
        optionD: "35",
        correctOption: "B",
      },
      {
        id: "seed-mm-q8",
        questionText: "Berapakah hasil dari 50 − 23?",
        optionA: "27",
        optionB: "28",
        optionC: "29",
        optionD: "30",
        correctOption: "A",
      },
      {
        id: "seed-mm-q9",
        questionText: "Segitiga memiliki berapa sisi?",
        optionA: "2",
        optionB: "3",
        optionC: "4",
        optionD: "5",
        correctOption: "B",
      },
      {
        id: "seed-mm-q10",
        questionText: "Berapakah hasil dari 9 + 6 + 5?",
        optionA: "18",
        optionB: "19",
        optionC: "20",
        optionD: "21",
        correctOption: "C",
      },
    ],
  },
];