# 🌾 PANGANITA

### Pangan dan Gizi untuk Keluarga

PANGANITA adalah aplikasi web untuk membantu perempuan produsen pangan dan keluarga mengelola hasil panen serta merencanakan pemanfaatannya untuk kebutuhan pangan keluarga. Aplikasi ini dikembangkan dengan pendekatan antarmuka yang sederhana agar mudah digunakan oleh pengguna dengan tingkat literasi digital yang beragam.

**Repository GitHub:** https://github.com/aulyaa12/Web-Panganita**Aplikasi Vercel:** [web-panganita-894764f1h-aulyaa12.vercel.app](https://web-panganita-894764f1h-aulyaa12.vercel.app/)

> **Status:** PANGANITA masih berupa prototipe yang dikembangkan bertahap. Hasil simulasi, data harga, dan perhitungan gizi belum boleh dianggap sebagai rekomendasi gizi yang tervalidasi.

---

## Daftar Isi

- [Fitur yang tersedia](#fitur-yang-tersedia)
- [Batasan saat ini](#batasan-saat-ini)
- [Teknologi](#teknologi)
- [Struktur utama proyek](#struktur-utama-proyek)
- [Menjalankan secara lokal](#menjalankan-secara-lokal)
- [Alur akun dan profil keluarga](#alur-akun-dan-profil-keluarga)
- [Database dan keamanan](#database-dan-keamanan)
- [Kontribusi tim](#kontribusi-tim)
- [Rencana pengembangan](#rencana-pengembangan)

## Fitur yang tersedia

### 1. Beranda

Menjelaskan tujuan PANGANITA, cara kerja aplikasi, dan alasan menyisihkan sebagian hasil panen untuk pangan keluarga. Beranda juga menjadi titik awal untuk menuju proses masuk.

### 2. Daftar akun dan login

- Pengguna dapat membuat akun dengan **email dan password** melalui Supabase Auth.
- Konfirmasi email saat ini **dinonaktifkan** pada konfigurasi Supabase pengembangan. Setelah berhasil mendaftar, pengguna dapat masuk tanpa menunggu konfirmasi email.
- Pengguna tetap perlu memasukkan email dan password yang sesuai saat login.
- Jangan menggunakan pengaturan konfirmasi email yang dinonaktifkan sebagai asumsi keamanan untuk produksi. Tinjau kembali pengaturan autentikasi sebelum aplikasi digunakan secara luas.

### 3. Profil keluarga

- Pengguna yang baru masuk dan belum memiliki profil diarahkan untuk mengisi profil keluarga.
- Formulir profil baru seharusnya dimulai dalam keadaan kosong, bukan terisi data pengguna lain atau data contoh.
- Setelah profil disimpan, data profil ditautkan ke identitas pengguna Supabase Auth.
- Data anak disimpan sebagai bagian dari profil keluarga yang bersangkutan.
- Pengguna yang sudah memiliki profil dapat membuka dan memeriksa data miliknya.

### 4. Dashboard dan akun

Dashboard dan navigasi membantu pengguna mengakses halaman utama, pindai panen, keluarga, riwayat, informasi akun, dan keluar sesuai status login.

### 5. Pindai dan simulasi pembagian panen

- Fitur pindai/simulasi dibatasi untuk **pengguna yang sudah login**. Pengguna yang belum login harus masuk terlebih dahulu.
- Pengguna dapat memasukkan informasi hasil panen dan melihat alternatif pembagian yang tersedia.
- Alternatif simulasi mencakup **Seimbang**, **Prioritas Gizi**, dan **Prioritas Uang**.
- Hasil dapat menampilkan jumlah yang disimpan untuk keluarga, jumlah yang dijual, dan perkiraan pendapatan sesuai data serta aturan prototipe yang digunakan.

### 6. Riwayat simulasi

Riwayat menampilkan simulasi yang telah tersimpan di database, termasuk alternatif pembagian dan pilihan pengguna jika tersedia. Data riwayat ditampilkan berdasarkan profil pengguna yang sedang login.

## Batasan saat ini

- **YOLO/Computer Vision belum terintegrasi penuh sebagai fitur deteksi panen yang tervalidasi.** Jangan menganggap aplikasi sudah dapat mengenali semua hasil panen secara otomatis hanya dari foto.
- **Estimasi berat atau volume dari gambar belum tervalidasi.** Angka berat yang digunakan dalam simulasi perlu berasal dari input atau konfirmasi yang tersedia pada alur aplikasi.
- **Depth Anything V2 belum terintegrasi sebagai estimasi berat/volume yang siap digunakan.**
- **Chatbot Bu Nita berbasis RAG belum terintegrasi penuh sebagai fitur siap pakai.**
- Rumus pembagian simpan-jual masih berupa prototipe dan perlu diuji. Hasilnya bukan pengganti saran ahli gizi atau tenaga kesehatan.
- Harga bahan pangan dapat berupa nilai awal perkiraan, bukan harga pasar langsung yang telah diverifikasi.
- Data hanya tersimpan jika proses penyimpanan berhasil, skema database sesuai, dan kebijakan akses Supabase mengizinkan operasi tersebut.

## Teknologi

- **Frontend:** Next.js App Router, React, JavaScript/JSX
- **Ikon:** Lucide React
- **Autentikasi:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **Styling:** CSS
- **Hosting/deployment:** Vercel
- **Version control:** Git dan GitHub

## Struktur utama proyek

Struktur berikut merangkum file aplikasi utama yang digunakan. File tambahan dapat tersedia sesuai keadaan repository.

```text
Web-Panganita/
├── app/
│   ├── akun/
│   │   └── page.jsx
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

- `app/page.jsx`: beranda.
- `app/masuk/page.jsx`: daftar akun dan login.
- `app/dashboard/page.jsx`: dashboard setelah login.
- `app/keluarga/page.jsx`: formulir dan pengelolaan profil keluarga serta data anak.
- `app/pindai/page.jsx`: input panen dan simulasi pembagian panen.
- `app/riwayat/page.jsx`: riwayat simulasi tersimpan.
- `app/akun/page.jsx`: informasi akun pengguna.
- `components/Navbar.jsx`: navigasi utama.
- `lib/supabase.js`: konfigurasi client Supabase.
- `app/globals.css`: styling global.

## Menjalankan secara lokal

### Prasyarat

- Node.js versi yang sesuai dengan proyek.
- npm.
- Git.
- Akses ke proyek Supabase PANGANITA.

### 1. Clone repository

```bash
git clone https://github.com/aulyaa12/Web-Panganita.git
cd Web-Panganita
```

### 2. Instal dependensi

```bash
npm install
```

### 3. Siapkan environment

Buat file `.env.local` di direktori utama proyek. Isi dengan URL dan public/anon key dari proyek Supabase yang benar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
```

Ganti nilai contoh sesuai proyek Supabase. Nama variabel harus cocok dengan yang dibaca oleh `lib/supabase.js`.

**Keamanan:** jangan commit `.env.local`, password, token pribadi, atau Supabase `service_role` key. `service_role` key tidak boleh diletakkan di frontend.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000. Untuk menghentikan server, tekan `Ctrl + C` pada terminal.

## Alur akun dan profil keluarga

1. Pengguna membuka halaman masuk.
2. Pengguna membuat akun menggunakan email dan password.
3. Karena konfirmasi email dinonaktifkan pada konfigurasi pengembangan saat ini, pengguna dapat login setelah pendaftaran berhasil.
4. Jika belum memiliki profil, pengguna diarahkan ke halaman keluarga untuk mengisi profil dan data anak yang diperlukan.
5. Setelah profil disimpan, pengguna dapat membuka dashboard dan menggunakan fitur pindai/simulasi.
6. Simulasi yang berhasil disimpan dapat ditampilkan kembali pada halaman riwayat.
7. Pengguna dapat keluar melalui tombol logout.

Jika akun sudah tercatat di Supabase Auth tetapi profil keluarga belum ada, itu tidak otomatis berarti terjadi kesalahan: akun autentikasi dan profil keluarga merupakan data yang berbeda. Profil dibuat atau disimpan melalui alur profil keluarga.

## Database dan keamanan

Skema database PANGANITA mencakup tabel berikut. Pastikan tabel yang benar-benar diterapkan pada proyek Supabase sesuai dengan skema yang digunakan aplikasi.

| Tabel                 | Fungsi                                                                             |
| --------------------- | ---------------------------------------------------------------------------------- |
| `profil_pengguna`   | Profil pengguna yang ditautkan ke `auth.users` melalui `id_pengguna_auth`.     |
| `data_anak`         | Data anak yang terhubung ke profil melalui `profil_id`.                          |
| `bahan_pangan`      | Katalog bahan pangan dan harga perkiraan awal.                                     |
| `gizi_bahan`        | Nilai gizi bahan pangan beserta sumber dan status verifikasinya.                   |
| `kebutuhan_gizi`    | Acuan kebutuhan gizi yang perlu memiliki sumber dan status verifikasi.             |
| `pemindaian_panen`  | Catatan sesi pemindaian; tabel ini tidak berarti model Vision AI sudah aktif.      |
| `item_panen`        | Item hasil pemindaian serta sumber/konfirmasi berat.                               |
| `riwayat_kalkulasi` | Input dan catatan setiap simulasi pembagian panen.                                 |
| `keputusan_panen`   | Alternatif keputusan untuk simulasi: Seimbang, Prioritas Gizi, dan Prioritas Uang. |

### Row Level Security (RLS)

- RLS digunakan untuk membatasi akses data pengguna.
- Kebijakan profil membatasi pembacaan, perubahan, dan penghapusan profil berdasarkan `id_pengguna_auth = auth.uid()`.
- Kebijakan `data_anak` memeriksa kepemilikan profil terkait sebelum mengizinkan operasi data.
- Setiap kebijakan untuk tabel lain perlu ditinjau berdasarkan relasi kepemilikan data dan operasi yang dibutuhkan aplikasi.
- Jangan menonaktifkan RLS hanya untuk mengatasi error akses. Periksa kebijakan, relasi, dan query terlebih dahulu.

Sebelum menjalankan ulang skrip SQL, periksa isinya dan pastikan targetnya benar. Skrip inisialisasi skema dapat membuat tabel atau memasukkan data awal dan tidak boleh dijalankan sembarangan pada database produksi yang sudah berisi data.

## Kontribusi tim

Agar pekerjaan anggota tim tidak saling menimpa, gunakan alur branch dan pull request.

### 1. Sinkronkan branch utama

```bash
git checkout main
git pull origin main
```

### 2. Buat branch pekerjaan

```bash
git checkout -b feature/nama-fitur
```

Contoh nama branch:

- `feature/chatbot-rag`
- `feature/vision-ai`
- `fix/profil-keluarga`
- `fix/riwayat`
- `docs/readme`

### 3. Jalankan dan uji perubahan

```bash
npm run dev
```

Uji halaman atau alur yang diubah. Periksa juga terminal dan browser untuk error.

### 4. Commit dan push branch

```bash
git status
git add path/file-yang-diubah
git commit -m "fix: deskripsi perubahan"
git push -u origin feature/nama-fitur
```

Gunakan path file yang memang ingin di-commit, dan periksa `git status` agar file rahasia tidak ikut ditambahkan.

### 5. Buat Pull Request

Buat Pull Request di GitHub menuju `main`. Minta anggota tim meninjau perubahan sebelum digabungkan. Hindari mengubah skema database produksi tanpa koordinasi.

## Rencana pengembangan

1. Menjaga alur pendaftaran, login, dan pembuatan profil keluarga tetap konsisten.
2. Memastikan data profil, data anak, dan riwayat tersimpan serta hanya dapat diakses oleh pemiliknya.
3. Memvalidasi rumus pembagian panen dan sumber data gizi/harga.
4. Mengintegrasikan serta menguji YOLO untuk identifikasi bahan pangan.
5. Mengevaluasi estimasi berat/volume, termasuk kemungkinan Depth Anything V2, menggunakan data uji yang sesuai.
6. Mengintegrasikan chatbot Bu Nita berbasis RAG setelah sumber pengetahuan dan evaluasinya siap.
7. Meninjau pengaturan keamanan dan autentikasi sebelum deployment untuk penggunaan lebih luas.

## Catatan penting

PANGANITA merupakan alat bantu perencanaan. Angka simulasi, perkiraan pendapatan, dan informasi gizi perlu diverifikasi. Jangan gunakan hasil prototipe sebagai pengganti rekomendasi ahli gizi atau tenaga kesehatan.

Dikembangkan untuk mendukung pengelolaan hasil panen, perencanaan pangan keluarga, dan pencegahan stunting melalui PANGANITA.
