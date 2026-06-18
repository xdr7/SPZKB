PROMPT APLIKASI SISTEM PAKAR SUPER LENGKAP
markdown

# KONTEKS PROYEK
Anda adalah seorang full-stack developer AI yang sangat ahli. Saya memiliki skripsi tahun 2011 tentang "Sistem Pakar Penggunaan Zat Kimia pada Makanan". Saya ingin Anda membuatkan **aplikasi web sistem pakar yang dinamis, modern, dan powerfull** untuk publik dengan antarmuka yang profesional.

## DOMAIN PENGETAHUAN (Knowledge Base)
Sistem pakar ini mendeteksi bahaya zat kimia pada 7 jenis makanan olahan dengan 4 jenis zat kimia pengawet menggunakan metode **Forward Chaining**.

### Data Master (sudah saya siapkan, tolong jadikan seed database):

**Zat Kimia:**
| Kode | Nama Zat | Efek Kesehatan | Solusi |
|------|----------|----------------|--------|
| Z001 | Kalsium Benzoat | Iritasi saluran cerna, reaksi alergi | Hentikan konsumsi, minum air putih, konsultasi dokter |
| Z002 | Kalium Nitrit | Methemoglobinemia (sesak napas), risiko kanker | Segera ke IGD, terapi metilen biru |
| Z003 | Kalsium Propionat | Migrain, alergi kulit, hiperaktivitas anak | Hentikan konsumsi, antihistamin jika perlu |
| Z004 | Natrium Metasulfat | Sesak napas (asma), syok anafilaksis | Inhaler untuk penderita asma, epinefrin jika berat |

**Makanan:**
M001: Daging Olahan (sosis, nugget, ham)
M002: Daging Awetan (dendeng, abon, kornet)
M003: Roti (roti tawar, roti manis, burger bun)
M004: Keju (keju olahan, keju cheddar, keju mozzarella)
M005: Selai (selai stroberi, selai nanas, marmalade)
M006: Udang Beku (udang beku mentah maupun matang)
M007: Acar (acar timun, acar sayuran dalam botol)

**Rules (IF-THEN) dengan metode Forward Chaining:**
- R1: IF (Z002 OR Z004) AND M001 THEN Berbahaya
- R2: IF (Z002 OR Z004) AND M002 THEN Berbahaya
- R3: IF (Z003 OR Z004) AND M003 THEN Berbahaya
- R4: IF (Z001 OR Z002 OR Z003) AND M004 THEN Berbahaya
- R5: IF (Z001 OR Z003) AND M005 THEN Berbahaya
- R6: IF (Z002 OR Z004) AND M006 THEN Berbahaya
- R7: IF (Z001 OR Z003) AND M007 THEN Berbahaya

**Batas Maksimum Penggunaan (per kg makanan):**
| Zat | Makanan | Max | Satuan |
|-----|---------|-----|--------|
| Kalsium Benzoat | Keju | 1 | gram |
| Kalsium Benzoat | Selai | 200 | mg |
| Kalsium Benzoat | Acar | 3 | gram |
| Kalium Nitrit | Daging Olahan | 125 | gram |
| Kalium Nitrit | Daging Awetan | 125 | gram |
| Kalium Nitrit | Keju | 1 | gram |
| Kalium Nitrit | Udang Beku | 125 | gram |
| Kalsium Propionat | Roti | 3 | mg |
| Kalsium Propionat | Keju | 3 | gram |
| Kalsium Propionat | Selai | 3 | gram |
| Kalsium Propionat | Acar | 3 | gram |
| Natrium Metasulfat | Daging Olahan | 100 | gram |
| Natrium Metasulfat | Daging Awetan | 100 | gram |
| Natrium Metasulfat | Roti | 100 | mg |
| Natrium Metasulfat | Udang Beku | 100 | mg |

---

## TEKNOLOGI YANG DIMINTA
Saya ingin aplikasi full-stack dengan stack berikut (pilih yang menurut Anda paling stabil dan scalable):

**Opsi A (Python - untuk kemudahan development):**
- Backend: FastAPI (lebih modern dari Flask)
- Database: PostgreSQL (production) atau SQLite (development)
- ORM: SQLAlchemy
- Frontend: React + Vite + Tailwind CSS + Axios
- Autentikasi: JWT (JSON Web Token)
- Deployment: Docker + bisa deploy ke Railway/Vercel

**Opsi B (Node.js - untuk performa):**
- Backend: Express.js + TypeScript
- Database: PostgreSQL + Prisma ORM
- Frontend: Next.js 14 (App Router) + Tailwind CSS
- Autentikasi: NextAuth.js
- Deployment: Vercel

**Pilih Opsi A (Python/FastAPI) karena lebih mudah saya modifikasi nanti.**

---

## FITUR YANG WAJIB ADA (WAJIB SEMUA)

### A. Halaman Publik (Tanpa Login)
1. **Landing Page yang Profesional**
   - Hero section dengan penjelasan sistem pakar
   - Statistik (jumlah zat, makanan, aturan)
   - Cara kerja sistem (3 langkah sederhana)
   - Testimonial palsu (placeholder)
   - Footer dengan kontak

2. **Halaman Konsultasi (Fitur INTI)**
   - Stepper/wizard 3 langkah:
     - Langkah 1: Pilih jenis makanan (card grid atau dropdown)
     - Langkah 2: Pilih zat kimia yang dicurigai (card dengan icon)
     - Langkah 3: Input kadar penggunaan (slider + number input) dan pilih satuan (mg/kg atau gram/kg)
   - Tombol "Analisis Sekarang" dengan animasi loading
   - **Hasil Analisis** ditampilkan dengan card yang indah:
     - Status: BAHYA (merah) / AMAN (hijau)
     - Progress bar perbandingan kadar vs batas maksimum
     - Penjelasan detail: efek kesehatan, solusi, saran
     - Tombol "Ekspor ke PDF" dan "Bagikan ke WhatsApp"
   - Riwayat konsultasi (disimpan di localStorage/indexedDB)

3. **Halaman Database Zat Kimia**
   - Tabel/search/filter semua zat kimia
   - Kartu detail per zat (klik untuk lihat efek dan solusi)

4. **Halaman Database Makanan**
   - Tabel semua makanan
   - Tampilkan zat kimia yang biasa terkandung di makanan tersebut

5. **Halaman Tentang Sistem**
   - Penjelasan metode Forward Chaining (dengan diagram)
   - Daftar semua aturan (rules) yang digunakan
   - Referensi akademik

### B. Admin Panel (Login diperlukan)
**Default admin credential:** username: `admin` | password: `admin123` (bisa diubah nanti)

1. **Dashboard**
   - Kartu statistik: total zat, total makanan, total aturan, total konsultasi
   - Grafik konsultasi per bulan (Chart.js atau ApexCharts)
   - Log aktivitas terbaru

2. **Manajemen Zat Kimia (CRUD Full)**
   - Tambah zat baru (kode, nama, efek, solusi)
   - Edit zat
   - Hapus zat (soft delete)
   - Upload gambar/icon zat

3. **Manajemen Makanan (CRUD Full)**
   - Tambah makanan baru
   - Edit makanan
   - Hapus makanan
   - Upload gambar makanan

4. **Manajemen Aturan (CRUD Full + Dinamis)**
   - Sistem aturan menggunakan **forward chaining** yang benar
   - Form builder untuk membuat aturan baru: IF (zat A OR zat B) AND makanan X THEN Bahaya
   - Aturan bisa diaktifkan/dinonaktifkan
   - Test aturan (simulasi sebelum disimpan)

5. **Manajemen Batas Maksimum (CRUD Full)**
   - Edit batas maksimum per pasangan (zat, makanan)
   - Riwayat perubahan batas (tracking siapa yang ubah dan kapan)

6. **Manajemen User Admin**
   - Ganti password
   - Tambah admin baru (role: superadmin, editor, viewer)

### C. Fitur Powerfull Tambahan
1. **Export Laporan**
   - Export hasil konsultasi ke PDF (menggunakan jsPDF atau ReportLab)
   - Export semua data zat/makanan/aturan ke Excel/CSV

2. **API Publik (RESTful)**
   - Endpoint: `/api/konsultasi` (POST) untuk integrasi dengan aplikasi lain
   - Endpoint: `/api/zat` (GET) untuk mengambil semua zat
   - Endpoint: `/api/makanan` (GET) untuk mengambil semua makanan
   - Dokumentasi API menggunakan Swagger/OpenAPI (FastAPI otomatis)

3. **Logging & Monitoring**
   - Semua konsultasi disimpan di database (waktu, IP, hasil)
   - Log akses admin (siapa login, apa yang diubah)

4. **Keamanan**
   - Rate limiting (maks 10 konsultasi per menit per IP)
   - Input validation dan sanitasi
   - SQL injection prevention (pakai ORM)
   - XSS protection (auto-escape template)

---

## STRUKTUR FILE YANG DIMINTA

project/
├── backend/
│ ├── app/
│ │ ├── init.py
│ │ ├── main.py (entry point FastAPI)
│ │ ├── config.py
│ │ ├── database.py (SQLAlchemy setup)
│ │ ├── models.py (User, Zat, Makanan, Rule, Batas, Konsultasi)
│ │ ├── schemas.py (Pydantic models)
│ │ ├── api/
│ │ │ ├── auth.py
│ │ │ ├── zat.py
│ │ │ ├── makanan.py
│ │ │ ├── rule.py
│ │ │ ├── konsultasi.py
│ │ │ └── dashboard.py
│ │ ├── services/
│ │ │ ├── inference_engine.py (forward chaining logic)
│ │ │ └── pdf_generator.py
│ │ └── utils/
│ │ └── security.py
│ ├── requirements.txt
│ ├── Dockerfile
│ └── .env
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── LandingPage.jsx
│ │ │ ├── KonsultasiWizard.jsx
│ │ │ ├── ZatList.jsx
│ │ │ ├── MakananList.jsx
│ │ │ ├── AdminDashboard.jsx
│ │ │ ├── AdminZat.jsx
│ │ │ ├── AdminMakanan.jsx
│ │ │ ├── AdminRule.jsx
│ │ │ └── AdminBatas.jsx
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ └── index.css (Tailwind)
│ ├── package.json
│ ├── vite.config.js
│ └── tailwind.config.js
├── docker-compose.yml (backend + postgres + frontend build)
├── seed_data.py (untuk mengisi data awal dari knowledge base)
└── README.md (cara install dan run)
text


---

## PERSYARATAN FINAL
1. **Kode harus LENGKAP dan LANGSUNG DIJALANKAN** (copy-paste lalu `docker-compose up` atau `python run.py` dan `npm run dev`)
2. **Semua fitur WAJIB ada** (tidak ada "TODO" atau placeholder kode)
3. **Tampilan harus PROFESIONAL** seperti aplikasi startup kesehatan modern (contoh: halodoc.com atau alodokter.com)
4. **Gunakan Tailwind CSS** untuk styling (jangan CSS biasa)
5. **Frontend harus RESPONSIF** (mobile-first)
6. **Backend harus memiliki ERROR HANDLING yang baik** (try-catch, HTTP 400/404/500)
7. **Sertakan file seed_data.py** yang otomatis mengisi database dengan data dari knowledge base di atas
8. **Sertakan file docker-compose.yml** agar mudah dijalankan di production

---

## TOLONG HASILKAN KODE LENGKAPNYA
Saya tahu ini proyek besar, tapi saya yakin Anda sebagai AI expert bisa melakukannya. Hasilkan kode yang **bersih, terstruktur, dokumentasi jelas, dan siap production**.

Mulai dari:
1. Struktur folder lengkap
2. Semua kode backend (FastAPI)
3. Semua kode frontend (React + Tailwind)
4. File konfigurasi (docker-compose, .env, dll)
5. Cara menjalankan aplikasi
