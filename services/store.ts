import { Listing, User, Category, AppState, ListingType, VerificationStatus, ListingStatus, Transaction, ListingReport, CityInsight, BlogPost, AppSettings, PropertyRequest } from '../types';

// --- APP CONFIGURATION & VERSIONS ---
// Gunakan konfigurasi di bawah ini untuk beralih antara Versi Mock dan Real.

export const APP_CONFIG = {
  // [VERSI 1: MOCK MODE] (Default)
  // Set 'false' untuk demo frontend saja (data tersimpan di browser).
  // [VERSI 2: REAL BACKEND]
  // Set 'true' untuk integrasi dengan API Server (Golang/Node.js).
  USE_REAL_BACKEND: false, 

  // [DEV UTILS]
  // Set 'true' untuk Auto-Login sebagai Admin saat refresh (Khusus Mock Mode).
  IS_DEV_MODE: true, 

  // Konfigurasi Akun Admin Default (Mock Mode)
  ADMIN_USERNAME: 'Vueltra Admin',
  ADMIN_EMAIL: 'admin@vueltra.com',
  ADMIN_PASSWORD: 'admin', 
  ADMIN_PHONE: '08120000000',

  // Database Key (Ubah versi ini untuk mereset data di browser pengguna)
  STORAGE_KEY: 'vueltra_db_v18_upload', 
};

// --- DEFAULT SYSTEM SETTINGS ---
const DEFAULT_SETTINGS: AppSettings = {
  // Set 'false' agar fitur ini mati secara default (sesuai request).
  // Admin bisa menyalakannya kembali lewat Admin Dashboard > Pengaturan.
  showMarketInsights: false,
  // Default Contact Info
  contactEmail: 'hello@vueltra.com',
  contactPhone: '021-555-8888',
  contactWorkingHours: 'Senin - Jumat (09:00 - 18:00 WIB)',
  contactAddress: 'Vueltra HQ, Jakarta Selatan, Indonesia'
};

// --- API ENDPOINTS ---
// 👇 GANTI URL DI BAWAH INI SESUAI ALAMAT SERVER BACKEND ANDA (Golang/Node/Python)
export const API_CONFIG = {
  // Contoh Local: 'http://localhost:8080/api/v1'
  // Contoh Prod: 'https://api.vueltra.com/v1'
  BASE_URL: 'http://localhost:8080/api/v1', 
  
  // 👇 Ganti string endpoint ini jika route backend Anda berbeda
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me', // Get current user profile
    UPDATE_PROFILE: '/users/me', // [FIX] Update own profile
    LISTINGS: '/listings',
    USERS: '/users',
    TRANSACTIONS: '/transactions',
    REPORTS: '/reports',
    BLOG: '/posts', // Endpoint Blog
    REQUESTS: '/requests', // Endpoint Requests
    VERIFICATION: '/verification/submit',
    UPLOAD: '/upload', // Untuk upload gambar
    MANAGE_CREDITS: '/admin/credits', // Endpoint manage credits
    ADMIN_USER_UPDATE: '/admin/users', // Endpoint admin update user
    ADMIN_VERIFY: '/admin/verify', // Endpoint verify
    SETTINGS: '/admin/settings' // Endpoint settings
  }
};

// --- API HELPER ---
const apiCall = async (endpoint: string, method = 'GET', body?: any) => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  // Ambil token dari localStorage jika ada
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Request Failed [${method} ${endpoint}]:`, error);
    throw error;
  }
};


// --- MOCK DATA (Fallback jika USE_REAL_BACKEND = false) ---
const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    username: 'JuraganProperti',
    email: 'juragan@example.com',
    phoneNumber: '08123456789',
    password: 'password123',
    credits: 500000,
    verificationStatus: VerificationStatus.VERIFIED,
    wishlist: [],
    joinedAt: Date.now() - 100000000,
    photoUrl: ''
  },
  {
    id: 'user_2',
    username: 'AgentSantoso',
    email: 'agent@example.com',
    phoneNumber: '08129876543',
    password: 'password123',
    credits: 0,
    verificationStatus: VerificationStatus.UNVERIFIED,
    wishlist: [],
    joinedAt: Date.now() - 50000000,
    photoUrl: ''
  },
  {
    id: 'admin_1',
    username: APP_CONFIG.ADMIN_USERNAME,
    email: APP_CONFIG.ADMIN_EMAIL,
    phoneNumber: APP_CONFIG.ADMIN_PHONE,
    password: APP_CONFIG.ADMIN_PASSWORD,
    credits: 999999999,
    verificationStatus: VerificationStatus.VERIFIED,
    isAdmin: true,
    wishlist: [],
    joinedAt: Date.now(),
    photoUrl: ''
  }
];

const INITIAL_REQUESTS: PropertyRequest[] = [
  {
    id: 'req_1',
    userId: 'user_99',
    userName: 'Budi Investor',
    userPhone: '0818888888',
    type: ListingType.JUAL,
    category: Category.RUMAH,
    location: 'Jakarta Selatan',
    budgetMin: 5000000000,
    budgetMax: 10000000000,
    description: 'Cari rumah hitung tanah di area Kebayoran atau Radio Dalam. Minimal luas tanah 300m. Siap transaksi cepat.',
    createdAt: Date.now() - 5000000,
    isExample: true
  },
  {
    id: 'req_2',
    userId: 'user_98',
    userName: 'Siti Kuliner',
    userPhone: '0817777777',
    type: ListingType.SEWA,
    category: Category.RUKO,
    location: 'Gading Serpong',
    budgetMin: 80000000,
    budgetMax: 150000000,
    description: 'Butuh ruko 2 lantai untuk usaha FnB. Lokasi harus ramai, dekat kampus UMN atau SMS. Budget max 150jt/tahun.',
    createdAt: Date.now() - 80000000,
    isExample: true
  }
];

const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post_1',
    title: '5 Kesalahan Fatal Saat Membeli Rumah Pertama',
    slug: 'kesalahan-beli-rumah-pertama',
    excerpt: 'Jangan sampai menyesal, pelajari hal-hal krusial yang sering dilewatkan pembeli pemula sebelum tanda tangan akad.',
    content: `Membeli rumah adalah keputusan finansial terbesar dalam hidup kebanyakan orang. Sayangnya, banyak pembeli pertama (first-time homebuyers) terjebak dalam euforia dan melupakan detail krusial.

Berikut adalah 5 kesalahan yang harus Anda hindari:

1. Tidak Memperhitungkan Biaya Tambahan
Harga rumah bukanlah satu-satunya biaya. Ada BPHTB (5%), Biaya Notaris, Biaya KPR (provisi, administrasi, asuransi jiwa & kebakaran), dan PPN (jika beli baru dari developer). Total biaya ini bisa mencapai 10-15% dari harga rumah.

2. Tergoda DP Murah tapi Cicilan Mencekik
Banyak developer menawarkan DP 0% atau sangat rendah. Hati-hati, ini biasanya berarti plafon pinjaman Anda lebih besar, sehingga cicilan bulanan menjadi sangat tinggi. Pastikan cicilan maksimal 30% dari penghasilan bulanan.

3. Tidak Melakukan Cek Lingkungan (Survei Lokasi)
Jangan hanya melihat rumah contoh. Datanglah ke lokasi di jam berbeda: pagi saat jam kerja (macet tidak?), malam hari (aman/gelap?), dan saat hujan deras (banjir tidak?).

4. Mengabaikan Legalitas Sertifikat
Pastikan sertifikat (SHM/HGB) sudah pecah jika beli dari developer, atau cek keaslian di BPN jika beli secondary. Jangan pernah transaksi jika legalitas masih sengketa.

5. Emosi Mengalahkan Logika
Jangan beli karena "jatuh cinta pada pandangan pertama" dengan desain interiornya. Cek struktur bangunan, atap, dan saluran air. Renovasi struktur jauh lebih mahal daripada ganti cat tembok.`,
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    category: 'Tips Pemula',
    author: 'Vueltra Team',
    createdAt: Date.now() - 10000000
  },
  {
    id: 'post_2',
    title: 'Investasi Properti: Pilih Tanah Kavling atau Apartemen?',
    slug: 'investasi-tanah-vs-apartemen',
    excerpt: 'Bingung menaruh uang dingin Anda? Simak perbandingan untung rugi antara investasi tanah kosong dan unit apartemen.',
    content: `Instrumen properti masih menjadi primadona investasi di Indonesia. Dua pilihan populer adalah Tanah Kavling dan Apartemen. Mana yang lebih cuan?

Kelebihan Tanah Kavling:
- Capital Gain Tinggi: Harga tanah cenderung selalu naik, jarang turun.
- Minim Perawatan: Tidak perlu maintenance bulanan seperti apartemen (IPL).
- Fleksibel: Bisa dibangun nanti atau dijual kembali.

Kekurangan Tanah Kavling:
- Tidak Ada Passive Income: Tanah kosong tidak menghasilkan uang sewa bulanan (kecuali disewakan untuk lahan usaha/pertanian).
- Risiko Penyerobotan: Harus sering dipantau agar tidak dipatok orang lain.

Kelebihan Apartemen:
- Yield Sewa Tinggi: Bisa disewakan bulanan atau harian (Airbnb), menghasilkan cashflow rutin.
- Lokasi Strategis: Biasanya di tengah kota, mudah disewakan ke pekerja/mahasiswa.

Kekurangan Apartemen:
- Biaya Maintenance (IPL) Tinggi: Harus bayar rutin meski unit kosong.
- Hak Milik Terbatas: Sertifikat strata title ada masa berlakunya (jika HGB di atas HPL).

Kesimpulan:
Jika Anda mencari "Tabungan Jangka Panjang" dengan modal minim perawatan, pilih TANAH.
Jika Anda mencari "Cashflow Bulanan" dan siap repot mengurus penyewa, pilih APARTEMEN.`,
    imageUrl: 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?auto=format&fit=crop&w=800&q=80',
    category: 'Investasi',
    author: 'Juragan Properti',
    createdAt: Date.now() - 20000000
  },
  {
    id: 'post_3',
    title: 'Cara Mengurus Sertifikat Balik Nama Mandiri (Tanpa Calo)',
    slug: 'cara-balik-nama-sertifikat',
    excerpt: 'Panduan lengkap mengurus legalitas properti ke BPN. Hemat biaya jutaan rupiah dengan mengurusnya sendiri.',
    content: `Mengurus balik nama sertifikat sebenarnya tidak serumit yang dibayangkan. Asalkan dokumen lengkap, Anda bisa menghemat jutaan rupiah jasa calo.

Langkah-langkah:

1. Siapkan Dokumen
- Sertifikat asli (SHM/HGB)
- AJB (Akta Jual Beli) dari PPAT
- Fotokopi KTP Penjual & Pembeli
- Fotokopi SPPT PBB tahun terakhir & bukti lunas
- Bukti bayar BPHTB (Pembeli) & PPh (Penjual)

2. Datang ke Kantor BPN
Kunjungi kantor Badan Pertanahan Nasional (BPN) sesuai domisili properti. Ambil antrian di loket pelayanan.

3. Isi Formulir Permohonan
Isi formulir yang disediakan, tandatangani di atas materai.

4. Pembayaran PNBP
Anda akan menerima Surat Perintah Setor (SPS) untuk membayar biaya layanan (Penerimaan Negara Bukan Pajak). Bayar di bank atau kantor pos persepsi.

5. Proses Balik Nama
Setelah bayar, serahkan bukti bayar. Proses biasanya memakan waktu 5 hari kerja hingga 2 minggu tergantung antrian.

Tips: Pastikan AJB sudah ditandatangani di hadapan PPAT resmi sebelum ke BPN.`,
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    category: 'Legalitas',
    author: 'Legal Vueltra',
    createdAt: Date.now() - 30000000
  },
  {
    id: 'post_4',
    title: 'Tren Rumah Minimalis Japandi: Kenapa Digemari Milenial?',
    slug: 'tren-rumah-japandi',
    excerpt: 'Perpaduan gaya Japanese dan Scandinavian yang fungsional dan estetik. Solusi hunian nyaman di lahan terbatas.',
    content: `Gaya Japandi (Japanese-Scandinavian) sedang merajai tren interior di Indonesia. Mengapa gaya ini sangat cocok untuk milenial?

1. Fungsionalitas Utama
Japandi fokus pada efisiensi. Furniture yang digunakan biasanya multifungsi (contoh: tempat tidur dengan laci penyimpanan), sangat cocok untuk rumah tipe 36 atau 45 yang umum dibeli milenial.

2. Warna Netral & Menenangkan
Dominasi warna putih, abu-abu, kayu muda (oak), dan sedikit aksen hitam menciptakan suasana zen yang menenangkan setelah seharian bekerja di kota yang sibuk.

3. Unsur Alam
Penggunaan material kayu solid, rotan, dan tanaman indoor membawa kesegaran alami ke dalam rumah.

4. Decluttering (Minim Barang)
Filosofi Japandi mengajarkan kita untuk hanya menyimpan barang yang benar-benar dipakai. Rumah jadi terlihat lebih luas, bersih, dan mudah dibersihkan.`,
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    category: 'Desain & Gaya Hidup',
    author: 'Vueltra Team',
    createdAt: Date.now() - 40000000
  },
  {
    id: 'post_5',
    title: 'Waspada Mafia Tanah: Modus dan Cara Menghindarinya',
    slug: 'waspada-mafia-tanah',
    excerpt: 'Kasus penyerobotan lahan marak terjadi. Kenali modus operandi mafia tanah agar aset Anda tetap aman.',
    content: `Mafia tanah seringkali bekerja secara terorganisir, bahkan melibatkan oknum aparat. Berikut modus yang sering terjadi:

1. Sertifikat Ganda
Mafia menerbitkan sertifikat baru di atas tanah yang sudah bersertifikat dengan memalsukan warkah (dokumen pendukung).
Solusi: Cek ploting tanah di aplikasi "Sentuh Tanahku" milik BPN. Pastikan tanah Anda sudah terpetakan secara digital.

2. Pemalsuan Kuasa Jual
Pura-pura meminjam sertifikat asli (misal: modus ingin cek keaslian), lalu memalsukan KTP pemilik dan membuat surat kuasa jual palsu di notaris fiktif.
Solusi: JANGAN PERNAH meminjamkan sertifikat asli ke calon pembeli/perantara. Cek keaslian hanya dilakukan bersama-sama di kantor BPN.

3. Pendudukan Lahan
Mengirim preman untuk menduduki lahan kosong yang lama tidak dipantau, lalu memagari dan mengklaim hak milik.
Solusi: Pasang plang tanda kepemilikan. Titipkan pengawasan ke warga lokal/RT setempat. Kunjungi aset secara berkala.`,
    imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
    category: 'Keamanan',
    author: 'Vueltra Team',
    createdAt: Date.now() - 50000000
  },
  {
    id: 'post_6',
    title: 'KPR Syariah vs Konvensional: Mana yang Lebih Menguntungkan?',
    slug: 'kpr-syariah-vs-konvensional',
    excerpt: 'Memahami perbedaan mendasar sistem bunga vs margin keuntungan agar cicilan rumah Anda sesuai prinsip dan kemampuan.',
    content: `Banyak pembeli rumah bingung memilih antara KPR Bank Konvensional atau KPR Syariah. Berikut perbandingan utamanya:

1. Sistem Bunga vs Margin
- Konvensional: Menggunakan sistem bunga (interest) yang mengacu pada BI Rate. Biasanya fix rate 1-3 tahun awal, lalu floating (mengambang) mengikuti pasar.
- Syariah: Menggunakan sistem jual-beli (Murabahah) atau sewa-beli (IMBT). Bank mengambil margin keuntungan yang disepakati di awal. Cicilan bersifat TETAP (Flat) sampai lunas.

2. Kepastian Cicilan
- Konvensional: Cicilan bisa naik drastis jika suku bunga naik (risiko ketidakpastian tinggi).
- Syariah: Cicilan pasti sama setiap bulan dari awal hingga akhir tenor (15-20 tahun). Ini memudahkan perencanaan keuangan keluarga.

3. Denda & Penalti
- Konvensional: Ada denda keterlambatan (persentase) dan penalti jika melunasi lebih cepat.
- Syariah: Tidak mengenal sistem denda berbunga (riba), biasanya hanya sanksi sosial atau denda yang disumbangkan. Pelunasan dipercepat tidak kena penalti, tapi margin bank tetap harus dibayar (meski seringkali ada diskon).

Kesimpulan:
Jika Anda ingin ketenangan hati dan cicilan yang pasti tidak berubah, KPR Syariah adalah pilihan tepat. Jika Anda yakin suku bunga akan turun dan ingin cicilan awal lebih rendah, Konvensional bisa dipertimbangkan.`,
    imageUrl: 'https://images.unsplash.com/photo-1554196522-37651a0279c6?auto=format&fit=crop&w=800&q=80',
    category: 'KPR & Pembiayaan',
    author: 'Vueltra Finance',
    createdAt: Date.now() - 5000000
  },
  {
    id: 'post_7',
    title: 'Kenapa Gading Serpong Makin Diminati di 2025?',
    slug: 'review-kawasan-gading-serpong',
    excerpt: 'Bedah tuntas potensi investasi properti di kawasan Gading Serpong. Fasilitas lengkap dan akses tol yang semakin mudah.',
    content: `Gading Serpong (Tangerang) terus bertransformasi menjadi kota mandiri yang sangat matang. Apa yang membuatnya tetap seksi di mata investor di tahun 2025?

1. Fasilitas Komersial Super Lengkap
Tidak perlu ke Jakarta. Ada Summarecon Mall Serpong (SMS), pasar modern, rumah sakit internasional (Bethsaida, St. Carolus), dan puluhan ruko kuliner viral. Gading Serpong dikenal sebagai surga kuliner Tangerang.

2. Aksesibilitas Tinggi
Diapit oleh dua akses tol utama: Tol Jakarta-Merak (via Gading Serpong/Alam Sutera) dan Tol JORR 2 (via BSD). Ini memudahkan mobilitas ke Bandara Soetta maupun ke Jakarta Selatan.

3. Target Pasar Sewa Jelas
Dikelilingi kampus ternama (UMN, Pradita, Matana). Potensi sewa kost atau apartemen studio sangat tinggi dengan yield mencapai 6-8% per tahun.

4. Kenaikan Harga Stabil
Karena lahan semakin terbatas (landed house baru semakin jarang), harga pasar sekunder (secondary market) di cluster lama terus merangkak naik. Ruko di area boulevard bahkan menjadi rebutan meski harganya fantastis.

Verdict: Gading Serpong bukan lagi "kota satelit" biasa, tapi destinasi hunian utama bagi keluarga muda dan mahasiswa.`,
    imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80',
    category: 'Review Kawasan',
    author: 'Juragan Properti',
    createdAt: Date.now() - 2000000
  }
];

const CITY_INSIGHTS_DATA: Record<string, CityInsight> = {
  'Jakarta Selatan': {
    location: 'Jakarta Selatan',
    avgPrice: 'Rp 28 - 55 Juta / m²',
    weather: 'Tropis (28°C)',
    famousFor: 'SCBD, Jaksel Lifestyle, TOD Area',
    transportation: 'Sangat Baik (MRT Fase 1 & LRT)',
    growthRate: '+6.5% (Stabil Premium)',
    rentalYield: '5% - 7% (Tinggi di Area MRT)',
    internetSpeed: 'Up to 1 Gbps (Fiber Available)',
    safetyIndex: '8/10',
    vibe: 'Modern, Green Living, Elite',
    developmentStatus: 'Mature & TOD Focused'
  },
  'Jakarta Pusat': {
    location: 'Jakarta Pusat',
    avgPrice: 'Rp 35 - 70 Juta / m²',
    weather: 'Tropis (29°C)',
    famousFor: 'Pusat Pemerintahan, Menteng',
    transportation: 'Sangat Baik (Sentral Integrasi)',
    growthRate: '+4.2% (Kenaikan Lahan Terbatas)',
    rentalYield: '5% (Market Expat)',
    internetSpeed: 'Up to 1 Gbps',
    safetyIndex: '9/10 (Ring 1)',
    vibe: 'Prestige, Formal',
    developmentStatus: 'Sangat Maju'
  },
  'Tangerang Selatan': {
    location: 'Tangerang Selatan (BSD/Bintaro)',
    avgPrice: 'Rp 16 - 32 Juta / m²',
    weather: 'Sejuk (27°C) & Asri',
    famousFor: 'Kota Mandiri, Digital Hub, Edukasi',
    transportation: 'Baik (Tol JORR 2 & KRL)',
    growthRate: '+10-12% (Highest Demand 2024)',
    rentalYield: '5% - 7% (Market Keluarga & Mahasiswa)',
    internetSpeed: 'Excellent (Smart City)',
    safetyIndex: '8.5/10',
    vibe: 'Modern Suburban, Family Friendly',
    developmentStatus: 'Berkembang Pesat (Sunrise Property)'
  },
  'Bali - Badung (Canggu/Seminyak)': {
    location: 'Canggu & Seminyak',
    avgPrice: 'Rp 25 - 50 Juta / m²',
    weather: 'Tropis Pantai (30°C)',
    famousFor: 'Digital Nomad, Beach Clubs, Sunset',
    transportation: 'Padat (Motor Dominan)',
    growthRate: '+15% (Sangat Tinggi)',
    rentalYield: '10% - 18% (ROI Sewa Harian)',
    internetSpeed: 'High Speed (Starlink Popular)',
    safetyIndex: '8/10',
    vibe: 'International, Vibrant, Creative',
    developmentStatus: 'Wisata Premium & Investasi Asing'
  },
  'Bali - Ubud': {
    location: 'Ubud',
    avgPrice: 'Rp 8 - 18 Juta / m²',
    weather: 'Sejuk Lembab (26°C)',
    famousFor: 'Wellness, Yoga, Sawah Terasering',
    transportation: 'Terbatas (Jalan Kecil)',
    growthRate: '+9% per tahun',
    rentalYield: '8% - 12% (Resort/Villa)',
    internetSpeed: 'Baik',
    safetyIndex: '9/10 (Sangat Aman)',
    vibe: 'Healing, Spiritual, Culture',
    developmentStatus: 'Wisata Budaya & Wellness'
  },
  'Bandung': {
    location: 'Bandung & Raya',
    avgPrice: 'Rp 9 - 18 Juta / m²',
    weather: 'Sejuk (21°C - 26°C)',
    famousFor: 'Wisata Akhir Pekan, Kuliner, Kreatif',
    transportation: 'Whoosh (Kereta Cepat) Impact',
    growthRate: '+7.5% (Area Tegal Luar/Padalarang Naik)',
    rentalYield: '5% - 6%',
    internetSpeed: 'Cepat',
    safetyIndex: '7.5/10',
    vibe: 'Kreatif, Heritage, Santai',
    developmentStatus: 'Kota Wisata & Pendidikan'
  },
  'Surabaya': {
    location: 'Surabaya',
    avgPrice: 'Rp 12 - 30 Juta / m²',
    weather: 'Panas (31°C+)',
    famousFor: 'Hub Bisnis Indonesia Timur, Crazy Rich',
    transportation: 'Jalan Tol Dalam Kota Lengkap',
    growthRate: '+6% (Surabaya Barat Favorit)',
    rentalYield: '5% - 7%',
    internetSpeed: 'Sangat Cepat',
    safetyIndex: '8/10',
    vibe: 'Bisnis, Metropolitan, Modern',
    developmentStatus: 'Maju (Infrastruktur Matang)'
  },
  'Yogyakarta': {
    location: 'Yogyakarta',
    avgPrice: 'Rp 4 - 10 Juta / m²',
    weather: 'Tropis (29°C)',
    famousFor: 'Pendidikan (UGM), Budaya, Pensiunan',
    transportation: 'KRL Solo-Jogja, Tol Jogja-Solo',
    growthRate: '+12% (Tanah Sleman/Bantul Naik)',
    rentalYield: '6% - 8% (Kost Mahasiswa)',
    internetSpeed: 'Baik',
    safetyIndex: '8.5/10 (Nyaman)',
    vibe: 'Slow Living, Tradisional',
    developmentStatus: 'Kota Pelajar & Wisata'
  }
};

const DEFAULT_INDONESIA_STATS: CityInsight = {
  location: 'Indonesia (Nasional)', avgPrice: 'Bervariasi', weather: 'Tropis (26°C - 33°C)', famousFor: 'Keindahan Alam & Investasi Berkembang', transportation: 'Berkembang (Infrastruktur Masif)', growthRate: '+5.5% Rata-rata Nasional', rentalYield: '4% - 7% per tahun', internetSpeed: 'Rata-rata 25 Mbps', safetyIndex: 'Stabil', vibe: 'Beragam Budaya', developmentStatus: 'Negara Berkembang'
};

const INITIAL_LISTINGS: Listing[] = [
  { id: 'p_1', sellerId: 'user_1', sellerName: 'JuraganProperti', title: 'Rumah Mewah Pondok Indah Siap Huni', description: 'Rumah mewah 2 lantai di kawasan elite Pondok Indah. Keamanan 24 jam, bebas banjir, dekat mall PIM.', price: 15000000000, category: Category.RUMAH, type: ListingType.JUAL, status: ListingStatus.ACTIVE, location: 'Jakarta Selatan', address: 'Jl. Metro Pondok Indah', imageUrl: 'https://images.unsplash.com/photo-1600596542815-2a4d9f6fac52?auto=format&fit=crop&w=800&q=80', surfaceArea: 500, buildingArea: 800, bedrooms: 5, bathrooms: 5, certificate: 'SHM', isPinned: true, whatsapp: '08123456789', createdAt: Date.now(), youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isExample: true },
  { id: 'p_2', sellerId: 'user_1', sellerName: 'JuraganProperti', title: 'Apartemen Puncak Kertajaya Murah', description: 'Jual cepat apartemen 2BR view city.', price: 350000000, category: Category.APARTEMEN, type: ListingType.JUAL, status: ListingStatus.ACTIVE, location: 'Surabaya', address: 'Kertajaya Indah', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', surfaceArea: 21, buildingArea: 21, bedrooms: 1, bathrooms: 1, certificate: 'Strata', isPinned: false, whatsapp: '08123456789', createdAt: Date.now() - 10000, isExample: true },
  { id: 'p_3', sellerId: 'user_1', sellerName: 'JuraganProperti', title: 'Ruko 3 Lantai Kelapa Gading', description: 'Ruko strategis di jalan utama boulevard.', price: 4500000000, category: Category.RUKO, type: ListingType.JUAL, status: ListingStatus.ACTIVE, location: 'Jakarta Utara', address: 'Kelapa Gading', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', surfaceArea: 90, buildingArea: 200, bedrooms: 2, bathrooms: 2, certificate: 'HGB', isPinned: false, whatsapp: '08123456789', createdAt: Date.now() - 20000, isExample: true },
  { id: 'p_4', sellerId: 'user_1', sellerName: 'JuraganProperti', title: 'Tanah Kavling Ubud View Sawah', description: 'Tanah pekarangan siap bangun villa.', price: 850000000, category: Category.TANAH, type: ListingType.JUAL, status: ListingStatus.ACTIVE, location: 'Bali - Ubud', address: 'Ubud', imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', surfaceArea: 300, buildingArea: 0, bedrooms: 0, bathrooms: 0, certificate: 'SHM', isPinned: true, whatsapp: '08123456789', createdAt: Date.now() - 30000, isExample: true },
  { id: 'p_20', sellerId: 'user_1', sellerName: 'JuraganProperti', title: 'Rumah Villa Canggu Bali', description: 'Villa modern tropical dengan private pool.', price: 5500000000, category: Category.RUMAH, type: ListingType.JUAL, status: ListingStatus.ACTIVE, location: 'Bali - Badung (Canggu/Seminyak)', address: 'Canggu', imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?auto=format&fit=crop&w=800&q=80', surfaceArea: 200, buildingArea: 250, bedrooms: 3, bathrooms: 3, certificate: 'SHM', isPinned: true, whatsapp: '08123456789', createdAt: Date.now() - 180000, youtubeUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', isExample: true }
];


const getInitialState = (): AppState => {
  const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEY);
  
  // 1. Mock Data Storage
  let mockState: AppState | null = null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure migration for new fields if accessing old data
      const migratedUsers = parsed.users.map((u: User) => ({
        ...u,
        wishlist: u.wishlist || [],
        verificationStatus: u.verificationStatus || VerificationStatus.UNVERIFIED,
        joinedAt: u.joinedAt || Date.now(),
        phoneNumber: u.phoneNumber || '',
        photoUrl: u.photoUrl || '' 
      }));

      // Listings migration: ensure youtubeUrl exists, isExample
      const migratedListings = parsed.listings.map((l: Listing) => ({
        ...l,
        youtubeUrl: l.youtubeUrl || '',
        isExample: l.isExample || false
      }));

      // Requests migration
      const migratedRequests = (parsed.requests || []).map((r: PropertyRequest) => ({
        ...r,
        isExample: r.isExample || false
      }));

      // Merge Settings properly to support new flags in future
      const mergedSettings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };

      mockState = {
        users: migratedUsers,
        listings: migratedListings,
        currentUser: parsed.currentUser,
        transactions: parsed.transactions || [],
        reports: parsed.reports || [],
        blogPosts: parsed.blogPosts || INITIAL_BLOG_POSTS, // Migrate Blog
        requests: migratedRequests.length > 0 ? migratedRequests : INITIAL_REQUESTS, // Migrate Requests
        settings: mergedSettings
      };
    } catch (e) {
      console.error("Storage Error", e);
    }
  }

  // Fallback default mock state
  if (!mockState) {
     mockState = {
        users: INITIAL_USERS,
        listings: INITIAL_LISTINGS,
        currentUser: null,
        transactions: [],
        reports: [],
        blogPosts: INITIAL_BLOG_POSTS,
        requests: INITIAL_REQUESTS,
        settings: DEFAULT_SETTINGS
     };
  }

  // 2. Real Backend Session Check
  let realUser: User | null = null;
  if (APP_CONFIG.USE_REAL_BACKEND) {
     const storedUser = localStorage.getItem('auth_user');
     if (storedUser) {
        try {
           realUser = JSON.parse(storedUser);
        } catch(e) { console.error("Real User Storage Error", e); }
     }
  }

  // Determine Current User based on Mode
  let activeUser = null;
  if (APP_CONFIG.USE_REAL_BACKEND) {
     activeUser = realUser; 
  } else {
     // Mock Mode: Check for Dev Auto-Login
     if (!mockState.currentUser && APP_CONFIG.IS_DEV_MODE) {
        console.log("DEV MODE: Auto-logging in as Admin");
        activeUser = INITIAL_USERS[2]; // Admin
     } else {
        activeUser = mockState.currentUser;
     }
  }

  return {
    ...mockState,
    currentUser: activeUser
  };
};

export const StoreService = {
  getState: (): AppState => {
    return getInitialState();
  },

  saveState: (state: AppState) => {
    if (!APP_CONFIG.USE_REAL_BACKEND) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(state));
    }
  },

  // --- SETTINGS METHODS ---
  getSettings: async (): Promise<AppSettings> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.SETTINGS);
    }
    const state = getInitialState();
    return state.settings;
  },

  updateSettings: async (newSettings: Partial<AppSettings>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.SETTINGS, 'PUT', newSettings);
    }
    const state = getInitialState();
    state.settings = { ...state.settings, ...newSettings };
    StoreService.saveState(state);
    return state.settings;
  },

  // --- REQUESTS (TITIP CARI) METHODS ---
  getRequests: async (): Promise<PropertyRequest[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REQUESTS);
    const state = getInitialState();
    return state.requests;
  },

  createRequest: async (req: Omit<PropertyRequest, 'id' | 'createdAt'>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REQUESTS, 'POST', req);
    const state = getInitialState();
    const newReq: PropertyRequest = {
      id: `req_${Date.now()}`,
      ...req,
      createdAt: Date.now()
    };
    state.requests.unshift(newReq);
    StoreService.saveState(state);
    return newReq;
  },

  deleteRequest: async (id: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(`${API_CONFIG.ENDPOINTS.REQUESTS}/${id}`, 'DELETE');
    const state = getInitialState();
    state.requests = state.requests.filter(r => r.id !== id);
    StoreService.saveState(state);
  },

  // --- BLOG METHODS ---
  getBlogPosts: async (): Promise<BlogPost[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(API_CONFIG.ENDPOINTS.BLOG);
    }
    const state = getInitialState();
    return state.blogPosts;
  },

  getBlogPostById: async (id: string): Promise<BlogPost | undefined> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       // GET /posts/:id
       return await apiCall(`${API_CONFIG.ENDPOINTS.BLOG}/${id}`);
    }
    const state = getInitialState();
    return state.blogPosts.find(p => p.id === id);
  },

  createBlogPost: async (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(API_CONFIG.ENDPOINTS.BLOG, 'POST', post);
    }
    const state = getInitialState();
    const newPost: BlogPost = {
       id: `post_${Date.now()}`,
       ...post,
       createdAt: Date.now()
    };
    state.blogPosts.unshift(newPost);
    StoreService.saveState(state);
    return newPost;
  },

  updateBlogPost: async (post: BlogPost) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.BLOG}/${post.id}`, 'PUT', post);
    }
    const state = getInitialState();
    const idx = state.blogPosts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
       state.blogPosts[idx] = post;
       StoreService.saveState(state);
    }
  },

  deleteBlogPost: async (id: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.BLOG}/${id}`, 'DELETE');
    }
    const state = getInitialState();
    state.blogPosts = state.blogPosts.filter(p => p.id !== id);
    StoreService.saveState(state);
  },

  // --- EXISTING METHODS ---

  getListings: async (): Promise<Listing[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        try {
           const data = await apiCall(API_CONFIG.ENDPOINTS.LISTINGS);
           return data; 
        } catch (e) {
           console.warn("Backend unavailable, falling back to mock");
           return getInitialState().listings;
        }
    } else {
        return getInitialState().listings;
    }
  },
  
  login: async (email: string, password: string): Promise<User> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        const data = await apiCall(API_CONFIG.ENDPOINTS.LOGIN, 'POST', { email, password });
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return data.user;
    } else {
        const state = getInitialState();
        const user = state.users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error("Email atau password salah");
        state.currentUser = user;
        StoreService.saveState(state);
        return user;
    }
  },

  logout: async () => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }
    const state = getInitialState();
    state.currentUser = null;
    StoreService.saveState(state);
  },

  register: async (username: string, email: string, password: string, phoneNumber: string): Promise<User> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       const data = await apiCall(API_CONFIG.ENDPOINTS.REGISTER, 'POST', { username, email, password, phoneNumber });
       return data.user;
    } else {
        const state = getInitialState();
        if (state.users.find(u => u.email === email)) throw new Error("Email sudah terdaftar");
        const newUser: User = { id: `user_${Date.now()}`, username, email, phoneNumber, password, credits: 0, verificationStatus: VerificationStatus.UNVERIFIED, wishlist: [], joinedAt: Date.now(), photoUrl: '' };
        state.users.push(newUser);
        state.currentUser = newUser;
        StoreService.saveState(state);
        return newUser;
    }
  },

  createListing: async (data: Omit<Listing, 'id' | 'sellerId' | 'sellerName' | 'createdAt' | 'isPinned' | 'status'>, asUserId?: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.LISTINGS, 'POST', { ...data, asUserId });
    } else {
        const state = getInitialState();
        if (!state.currentUser) throw new Error("Unauthorized");
        let sellerId = state.currentUser.id;
        let sellerName = state.currentUser.username;
        if (asUserId && state.currentUser.isAdmin) {
            const targetUser = state.users.find(u => u.id === asUserId);
            if (targetUser) { sellerId = targetUser.id; sellerName = targetUser.username; }
        }
        const newListing: Listing = { id: `p_${Date.now()}`, sellerId, sellerName, ...data, isPinned: false, status: ListingStatus.ACTIVE, createdAt: Date.now() };
        state.listings.unshift(newListing);
        StoreService.saveState(state);
        return newListing;
    }
  },

  adminManageCredits: async (userId: string, amount: number, type: 'ADD' | 'SUBTRACT') => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(API_CONFIG.ENDPOINTS.MANAGE_CREDITS, 'POST', { userId, amount, type });
    } else {
        const state = getInitialState();
        const userIdx = state.users.findIndex(u => u.id === userId);
        if (userIdx !== -1) {
            if (type === 'ADD') state.users[userIdx].credits += amount;
            else state.users[userIdx].credits = Math.max(0, state.users[userIdx].credits - amount);
            state.transactions.push({ id: `trx_admin_${Date.now()}`, userId: userId, type: type === 'ADD' ? 'TOPUP' : 'SPEND', amount: amount, description: type === 'ADD' ? 'Top Up by Admin' : 'Penyesuaian Admin (Deduct)', date: Date.now() });
            if (state.currentUser && state.currentUser.id === userId) state.currentUser = state.users[userIdx];
            StoreService.saveState(state);
            return true;
        }
        return false;
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
      const endpoint = userId === 'me' ? API_CONFIG.ENDPOINTS.UPDATE_PROFILE : `${API_CONFIG.ENDPOINTS.ADMIN_USER_UPDATE}/${userId}`;
      const res = await apiCall(endpoint, 'PUT', updates);
      if (userId === 'me') localStorage.setItem('auth_user', JSON.stringify(res.user));
      return res;
    } else {
      const state = getInitialState();
      let targetUserId = userId;
      if (userId === 'me' && state.currentUser) targetUserId = state.currentUser.id;
      const userIdx = state.users.findIndex(u => u.id === targetUserId);
      if (userIdx !== -1) {
        const updatedUser = { ...state.users[userIdx], ...updates };
        state.users[userIdx] = updatedUser;
        if (state.currentUser && state.currentUser.id === targetUserId) state.currentUser = updatedUser;
        if (updates.username) { state.listings.forEach(l => { if (l.sellerId === targetUserId) l.sellerName = updates.username!; }); }
        StoreService.saveState(state);
      }
    }
  },

  getUsers: async (): Promise<User[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.USERS);
    return getInitialState().users;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.TRANSACTIONS);
    const state = getInitialState();
    return state.transactions.filter(t => t.userId === state.currentUser?.id).sort((a,b) => b.date - a.date);
  },

  getReports: async (): Promise<ListingReport[]> => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REPORTS);
    return getInitialState().reports;
  },

  getCityInsight: async (location: string): Promise<CityInsight> => {
    return CITY_INSIGHTS_DATA[location] || DEFAULT_INDONESIA_STATS;
  },

  resetPassword: async (email: string) => {
    const state = getInitialState();
    if (!state.users.find(u => u.email === email)) throw new Error("Email tidak terdaftar");
    return true;
  },

  updateListing: async (listing: Listing) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${listing.id}`, 'PUT', listing);
    }
    const state = getInitialState();
    const idx = state.listings.findIndex(l => l.id === listing.id);
    if (idx !== -1) { state.listings[idx] = listing; StoreService.saveState(state); }
  },

  updateListingStatus: async (id: string, status: ListingStatus) => {
     if (APP_CONFIG.USE_REAL_BACKEND) {
        return await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${id}/status`, 'PATCH', { status });
     }
     const state = getInitialState();
     const listing = state.listings.find(l => l.id === id);
     if (listing) { listing.status = status; StoreService.saveState(state); }
  },

  deleteListing: async (id: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       return await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${id}`, 'DELETE');
    }
    const state = getInitialState();
    state.listings = state.listings.filter(l => l.id !== id);
    StoreService.saveState(state);
  },

  pinListing: async (id: string, cost: number) => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
       try {
          await apiCall(`${API_CONFIG.ENDPOINTS.LISTINGS}/${id}/pin`, 'POST', { cost });
          return true;
       } catch (e) { return false; }
    }
    const state = getInitialState();
    if (!state.currentUser) return false;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx === -1 || state.users[userIdx].credits < cost) return false;
    const listing = state.listings.find(l => l.id === id);
    if (!listing) return false;
    state.users[userIdx].credits -= cost;
    listing.isPinned = true;
    state.transactions.push({ id: `trx_${Date.now()}`, userId: state.users[userIdx].id, type: 'SPEND', amount: cost, description: `Promosi Listing: ${listing.title}`, date: Date.now() });
    state.currentUser = state.users[userIdx];
    StoreService.saveState(state);
    return true;
  },

  adminTogglePin: async (id: string, status: boolean) => {
    const state = getInitialState();
    const listing = state.listings.find(l => l.id === id);
    if (listing) { listing.isPinned = status; StoreService.saveState(state); }
  },

  debugAddCredits: async (amount: number) => {
    const state = getInitialState();
    if (!state.currentUser) return;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx !== -1) {
      state.users[userIdx].credits += amount;
      state.transactions.push({ id: `trx_${Date.now()}`, userId: state.currentUser.id, type: 'TOPUP', amount: amount, description: 'Top Up Saldo Iklan', date: Date.now() });
      state.currentUser = state.users[userIdx];
      StoreService.saveState(state);
    }
  },

  toggleWishlist: async (listingId: string): Promise<boolean> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
      const res = await apiCall(API_CONFIG.ENDPOINTS.LISTINGS + `/${listingId}/wishlist`, 'POST');
      return res.isWishlisted;
    }
    const state = getInitialState();
    if (!state.currentUser) return false;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx === -1) return false;
    let wishlist = state.users[userIdx].wishlist || [];
    let added = false;
    if (wishlist.includes(listingId)) { wishlist = wishlist.filter(id => id !== listingId); } 
    else { wishlist.push(listingId); added = true; }
    state.users[userIdx].wishlist = wishlist;
    state.currentUser = state.users[userIdx]; 
    StoreService.saveState(state);
    return added;
  },

  submitVerification: async (ktp: string, selfie: string, card?: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.VERIFICATION, 'POST', { ktpUrl: ktp, selfieUrl: selfie, agentCardUrl: card });
    const state = getInitialState();
    if (!state.currentUser) return;
    const userIdx = state.users.findIndex(u => u.id === state.currentUser?.id);
    if (userIdx !== -1) {
      state.users[userIdx].verificationStatus = VerificationStatus.PENDING;
      state.users[userIdx].ktpUrl = ktp;
      state.users[userIdx].selfieUrl = selfie;
      state.currentUser = state.users[userIdx];
      StoreService.saveState(state);
    }
  },

  adminVerifyUser: async (userId: string, status: VerificationStatus) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_VERIFY, 'POST', { userId, status });
    const state = getInitialState();
    const userIdx = state.users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      state.users[userIdx].verificationStatus = status;
      if (state.currentUser && state.currentUser.id === userId) state.currentUser.verificationStatus = status;
      StoreService.saveState(state);
    }
  },

  submitReport: async (listingId: string, reason: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.REPORTS, 'POST', { listingId, reason });
    const state = getInitialState();
    if (!state.currentUser) return;
    const listing = state.listings.find(l => l.id === listingId);
    state.reports.push({ id: `rpt_${Date.now()}`, listingId, listingTitle: listing ? listing.title : 'Unknown', reporterId: state.currentUser.id, reporterName: state.currentUser.username, reason, date: Date.now() });
    StoreService.saveState(state);
  },

  deleteReport: async (id: string) => {
    const state = getInitialState();
    state.reports = state.reports.filter(r => r.id !== id);
    StoreService.saveState(state);
  },

  getAgentProfile: async (agentId: string) => {
    if (APP_CONFIG.USE_REAL_BACKEND) return await apiCall(API_CONFIG.ENDPOINTS.USERS + `/${agentId}/public`);
    const state = getInitialState();
    const agent = state.users.find(u => u.id === agentId);
    if (!agent) return null;
    const listings = state.listings.filter(l => l.sellerId === agentId);
    return { agent, listings };
  },

  // --- NEW: UPLOAD IMAGE HELPER ---
  uploadImage: async (file: File): Promise<string> => {
    if (APP_CONFIG.USE_REAL_BACKEND) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Custom fetch call for Multipart because content-type must be auto-set by browser
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD}`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error("Upload error", error);
            throw error;
        }
    } else {
        // Mock Mode: Convert to Base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
  }
};