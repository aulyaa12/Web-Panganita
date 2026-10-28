
# 🌾 PANGANITA

### Pangan dan Gizi untuk Keluarga

PANGANITA adalah aplikasi web yang dirancang untuk membantu perempuan produsen pangan dan keluarga dalam mengelola hasil panen serta merencanakan pemanfaatannya untuk mendukung kebutuhan pangan keluarga dan pencegahan stunting.

Aplikasi ini menyediakan pengelolaan profil keluarga, simulasi pembagian hasil panen, pencatatan riwayat simulasi, dan autentikasi pengguna.

**Repository:** https://github.com/aulyaa12/Web-Panganita

---

## 📌 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Struktur Folder](#-struktur-folder)
- [Persiapan Lingkungan](#-persiapan-lingkungan)
- [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
- [Sistem Login](#-sistem-login)
- [Database dan Keamanan](#-database-dan-keamanan)
- [Panduan Kontribusi](#-panduan-kontribusi)
- [Status Pengembangan](#-status-pengembangan)

## 🌱 Fitur Utama

### 1. Autentikasi Pengguna

Login menggunakan email melalui Supabase Auth dengan metode tautan login atau verifikasi email sesuai konfigurasi autentikasi.

### 2. Profil Keluarga

Menyimpan informasi Mama dan anggota keluarga, termasuk data anak, sebagai dasar perencanaan pangan.

### 3. Simulasi Pembagian Panen

Membandingkan alternatif pembagian hasil panen berdasarkan jumlah panen, kebutuhan keluarga, dan parameter simulasi yang diterapkan.

Alternatif yang ditampilkan meliputi:

- Seimbang
- Prioritas Gizi
- Prioritas Uang

Hasil simulasi merupakan alat bantu perencanaan. Nilai target gizi dan rekomendasi perlu divalidasi sebelum digunakan sebagai dasar keputusan nyata.

### 4. Riwayat Simulasi

Menampilkan catatan simulasi yang telah disimpan, termasuk alternatif pembagian yang dipilih pengguna.

### 5. Dashboard

Menyediakan akses ke fitur utama dan ringkasan profil keluarga serta aktivitas panen yang tersedia.

### 6. Akun Pengguna

Menampilkan informasi akun login dan profil keluarga yang terhubung dengan akun tersebut.

## 🛠️ Teknologi

| Teknologi         | Fungsi                                    |
| ----------------- | ----------------------------------------- |
| Next.js           | Framework aplikasi web dan routing        |
| React             | Pembuatan antarmuka interaktif            |
| JavaScript        | Logika aplikasi                           |
| Supabase Auth     | Autentikasi dan pengelolaan sesi pengguna |
| Supabase Database | Penyimpanan dan pengambilan data          |
| CSS               | Styling dan desain responsif              |
| Lucide React      | Ikon antarmuka                            |
| Git dan GitHub    | Version control dan kolaborasi tim        |

## 📂 Struktur Folder

Berikut fungsi bagian-bagian utama proyek.

```text
Web-Panganita/
├── app/
│   ├── akun/
│   │   └── page.jsx
│   ├── auth/
│   │   └── callback/
│   │       └── page.jsx
│   ├── dashboard/
│   │   └── page.jsx
│   ├── keluarga/
│   │   └── page.jsx
│   ├── masuk/
│   │   └── page.jsx
│   ├── pindai/
│   │   └── page.jsx
│   ├── riwayat/
│   │   └── page.jsx
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   └── Navbar.jsx
├── lib/
│   └── supabase.js
├── public/
│   └── logo-panganita.png
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*Catatan: struktur di atas menggambarkan file utama. File tambahan dapat muncul sesuai perkembangan implementasi.*

### Penjelasan folder dan file

| Folder/File            | Fungsi                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `app/page.jsx`       | Halaman beranda pada URL `/`.                                                         |
| `app/akun/`          | Halaman informasi akun pengguna.                                                        |
| `app/auth/callback/` | Memproses callback autentikasi setelah pengguna mengikuti tautan login atau verifikasi. |
| `app/dashboard/`     | Halaman dashboard dan ringkasan aktivitas.                                              |
| `app/keluarga/`      | Formulir dan pengelolaan profil keluarga.                                               |
| `app/masuk/`         | Halaman login menggunakan email.                                                        |
| `app/pindai/`        | Alur pengelolaan panen dan simulasi pembagian hasil panen.                              |
| `app/riwayat/`       | Halaman riwayat simulasi panen.                                                         |
| `app/globals.css`    | Styling global, warna, tipografi, komponen, dan responsivitas.                          |
| `app/layout.jsx`     | Layout dasar yang digunakan bersama oleh halaman aplikasi.                              |
| `components/`        | Komponen UI yang digunakan ulang, termasuk navigasi utama.                              |
| `lib/supabase.js`    | Inisialisasi client Supabase untuk autentikasi dan akses database.                      |
| `public/`            | Aset statis, seperti logo dan gambar.                                                   |
| `.env.example`       | Template nama variabel konfigurasi tanpa kredensial asli.                               |
| `.env.local`         | Konfigurasi lokal yang tidak boleh diunggah ke GitHub.                                  |
| `.gitignore`         | Mengatur file dan folder yang dikecualikan dari Git.                                    |
| `package.json`       | Daftar dependensi dan perintah untuk menjalankan proyek.                                |

## 💻 Persiapan Lingkungan

Pastikan perangkat telah memiliki:

- [Node.js](https://nodejs.org/) versi yang sesuai dengan dependensi proyek.
- npm.
- [Git](https://git-scm.com/).
- Akun dan akses ke proyek Supabase yang digunakan PANGANITA.

## 🚀 Cara Menjalankan Aplikasi

### 1. Clone repository

Buka terminal dan jalankan:

```bash
git clone https://github.com/aulyaa12/Web-Panganita.git
cd Web-Panganita
```

### 2. Instal dependensi

```bash
npm install
```

### 3. Konfigurasi environment variables

Buat file `.env.local` pada folder utama proyek.

Isi dengan konfigurasi proyek Supabase yang benar:

```env
NEXT_PUBLIC_SUPABASE_URL=URL_PROYEK_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
```

Ganti nilai contoh tersebut dengan konfigurasi milik lingkungan pengembangan yang digunakan.

Variabel di atas mengikuti nama yang digunakan oleh client Supabase pada proyek ini. Jika konfigurasi kode berubah, sesuaikan nama variabelnya.

**Penting:** jangan mengunggah `.env.local` ke repository. Jangan memasukkan password, token rahasia, atau Supabase `service_role` key ke dalam kode frontend.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka browser dan akses:

http://localhost:3000

Untuk menghentikan server pengembangan, tekan `Ctrl + C` pada terminal.

## 🔐 Sistem Login

PANGANITA menggunakan Supabase Auth untuk mengelola autentikasi pengguna.

### Alur login

1. Pengguna membuka halaman `/masuk`.
2. Pengguna memasukkan alamat email aktif.
3. Supabase mengirimkan tautan login atau pesan verifikasi sesuai konfigurasi autentikasi.
4. Pengguna membuka tautan atau menyelesaikan verifikasi.
5. Aplikasi memproses callback autentikasi.
6. Pengguna diarahkan ke halaman yang sesuai dengan status profilnya.

### Ketentuan login

- Pengguna harus menggunakan email yang dapat diakses.
- Tautan login dapat memiliki masa berlaku dan hanya dapat digunakan sesuai ketentuan Supabase.
- Sesi login dapat dipertahankan setelah browser ditutup selama sesi dan token masih valid serta belum diakhiri.
- Setelah logout, pengguna perlu melakukan autentikasi kembali.
- Email dan kredensial login tidak boleh dibagikan kepada orang lain.

Untuk deployment, URL callback dan pengaturan redirect Supabase harus disesuaikan dengan domain deployment, misalnya domain Vercel yang digunakan.

## 🗄️ Database dan Keamanan

PANGANITA menggunakan Supabase untuk autentikasi dan penyimpanan data.

Tabel yang digunakan dalam sistem mencakup:

- `profil_pengguna` — informasi profil pengguna dan keluarga.
- `data_anak` — informasi anak yang terhubung dengan profil keluarga.
- `bahan_pangan` — data bahan pangan.
- `gizi_bahan` — informasi gizi bahan pangan.
- `item_panen` — data item hasil panen.
- `kebutuhan_gizi` — data kebutuhan gizi.
- `keputusan_panen` — data keputusan atau hasil pembagian panen.
- `pemindaian_panen` — data terkait pemindaian panen.
- `riwayat_kalkulasi` — catatan hasil perhitungan.

Nama dan struktur tabel harus mengikuti skema database aktual yang digunakan pada proyek Supabase.

### Ketentuan keamanan

1. Aktifkan dan tinjau kebijakan Row Level Security (RLS) untuk tabel yang menyimpan data pengguna.
2. Pastikan pengguna hanya dapat membaca atau mengubah data yang diizinkan.
3. Jangan menempatkan kredensial rahasia di kode frontend.
4. Jangan mengunggah `.env.local` ke GitHub.
5. Periksa perubahan skema database sebelum diterapkan ke lingkungan produksi.
6. Jangan membagikan akun pribadi atau kredensial Supabase kepada anggota tim yang tidak berwenang.

## 🤝 Panduan Kontribusi

Anggota tim dapat berkontribusi melalui GitHub dengan alur kerja berikut.

### 1. Sinkronkan repository

```bash
git checkout main
git pull origin main
```

### 2. Buat branch baru

Gunakan nama branch sesuai pekerjaan yang dilakukan.

```bash
git checkout -b feature/nama-fitur
```

Contoh:

- `feature/chatbot-rag`
- `fix/profil-keluarga`
- `fix/navbar`
- `docs/readme`

### 3. Kerjakan dan uji perubahan

Jalankan aplikasi secara lokal:

```bash
npm run dev
```

Pastikan fitur yang diubah berfungsi dan tidak menimbulkan error baru.

### 4. Commit perubahan

```bash
git add .
git commit -m "feat: deskripsi perubahan"
```

Periksa `git status` sebelum commit untuk memastikan file rahasia tidak ikut ditambahkan.

### 5. Push branch

```bash
git push -u origin feature/nama-fitur
```

### 6. Buat Pull Request

Buka GitHub, buat Pull Request dari branch yang dikerjakan menuju `main`, kemudian minta anggota tim melakukan peninjauan sebelum perubahan digabungkan.

### Aturan kolaborasi

- Hindari mengerjakan perubahan besar langsung pada branch `main`.
- Jangan mengunggah file `.env.local`, `node_modules/`, atau hasil build `.next/`.
- Jangan mengubah skema database produksi tanpa koordinasi.
- Jangan menimpa pekerjaan anggota tim tanpa memeriksa perubahan terbaru.
- Dokumentasikan fitur baru pada README ketika implementasinya sudah jelas.

## 🔬 Status Pengembangan

PANGANITA dikembangkan secara bertahap.

Fokus pengembangan meliputi:

- Penyempurnaan pengalaman pengguna.
- Integrasi dan validasi data profil keluarga.
- Penyempurnaan penyimpanan dan riwayat simulasi panen.
- Validasi aturan pembagian panen dan perhitungan gizi.
- Integrasi Vision AI untuk membantu proses identifikasi hasil panen sesuai implementasi yang diuji.
- Integrasi chatbot berbasis Retrieval-Augmented Generation (RAG) untuk mendukung akses informasi pangan dan gizi.

Status implementasi Vision AI dan chatbot RAG harus diperbarui berdasarkan kode, konfigurasi, dan pengujian aktual. Dokumentasi ini tidak menganggap integrasi yang belum diverifikasi sebagai fitur yang sudah selesai.

**Peringatan:** hasil simulasi pembagian panen dan parameter gizi yang masih berstatus prototipe bukan pengganti rekomendasi ahli gizi. Hasil harus divalidasi sebelum digunakan untuk keputusan nyata.

---

Dikembangkan untuk mendukung pengelolaan hasil panen, perencanaan pangan keluarga, dan pencegahan stunting melalui PANGANITA.
