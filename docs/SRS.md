# 📋 Software Requirements Specification (SRS)

**Project Name:** AI Deck Presenter (MVP)

**Document Focus:** Functional & Non-Functional Requirements

---

## 1. Functional Requirements (FR)

Functional Requirements mendefinisikan fitur dan perilaku sistem yang harus berjalan secara langsung.

### 1.1 Authentication & Access Control

* **FR-1.1:** Sistem harus menyediakan halaman login khusus *owner* menggunakan Supabase Auth (Email + Password).
* **FR-1.2:** Sistem harus memproteksi route `/dashboard` dari akses publik (*unauthenticated users*).
* **FR-1.3:** Sistem harus menyediakan fungsi *Logout* untuk mengakhiri sesi aktif *owner*.

### 1.2 Presentation Management (Dashboard)

* **FR-2.1:** Sistem harus menyediakan form/modal *upload* file presentasi berformat `.html`.
* **FR-2.2:** Sistem harus menerima input metadata presentasi saat *upload*, meliputi:
* Judul Presentasi (*string*, mandatory)
* Custom Slug (*string*, mandatory & unique)
* Deskripsi Singkat (*string*, optional)
* Catatan Prompt AI (*string/text*, optional)


* **FR-2.3:** Sistem harus menampilkan seluruh daftar presentasi dalam bentuk *grid/card* di halaman `/dashboard`.
* **FR-2.4:** Sistem harus menyediakan tombol aksi pada tiap kartu presentasi:
* **View:** Membuka viewer presentasi di tab baru.
* **Copy Link:** Menyalin URL publik (`/p/[slug]`) ke *clipboard*.
* **Delete:** Menghapus data presentasi dari database dan file terkait di Supabase Storage.



### 1.3 File Processing & Storage

* **FR-3.1:** Sistem harus menyimpan file `.html` yang di-upload ke Supabase Storage bucket `decks/`.
* **FR-3.2:** Sistem harus menyimpan metadata presentasi ke dalam database Supabase Postgres (`presentations`).
* **FR-3.3:** Sistem harus mengaitkan ID *owner* yang sedang login dengan data presentasi yang di-upload.

### 1.4 Presentation Viewer (`/p/[slug]`)

* **FR-4.1:** Sistem harus menyajikan tampilan presentasi *full-screen/distraction-free* tanpa *navbar* dashboard.
* **FR-4.2:** Sistem harus merender file `.html` dari storage di dalam elemen `<iframe>` tersandbox.
* **FR-4.3:** Sistem harus menyediakan *floating control overlay* di pojok kanan bawah yang berisi:
* **Fullscreen Toggle Button:** Mengaktifkan mode layar penuh via HTML5 Fullscreen API.
* **Share Button:** Menyalin URL presentasi.



---

## 2. Non-Functional Requirements (NFR)

Non-Functional Requirements mendefinisikan standar kualitas, keamanan, dan performa sistem.

### 2.1 Security & Data Privacy (Zero Trust)

* **NFR-1.1 (Sandboxing):** Elemen `<iframe>` pada viewer wajib menggunakan atribut `sandbox="allow-scripts allow-same-origin allow-popups allow-forms"` untuk mengisolasi eksekusi JavaScript hasil generate AI dari domain utama.
* **NFR-1.2 (Row Level Security):** Database Supabase wajib menerapkan RLS (*Row Level Security*) agar operasi *write/delete* hanya bisa dilakukan oleh *authenticated owner*.
* **NFR-1.3 (Public Read Access):** File `.html` pada storage bucket hanya bisa dibaca (*read-only*) oleh publik.

### 2.2 Performance & Responsiveness

* **NFR-2.1 (Fast Rendering):** Halaman publik `/p/[slug]` harus memanfaatkan Astro SSR/Static Rendering dengan target waktu muat (*First Contentful Paint*) kurang dari 1.5 detik.
* **NFR-2.2 (Minimal Overhead):** Viewer tidak boleh memuat skrip atau *styling* berat di luar kebutuhan dasar *floating control bar*.
* **NFR-2.3 (Fluid UI):** Antarmuka dashboard menggunakan Framer Motion untuk transisi *modal* dan *card list* dengan *frame rate* stabil 60fps.

### 2.3 Usability & User Experience

* **NFR-3.1 (Responsive Design):** Dashboard dan Viewer harus tampil optimal di berbagai resolusi layar (Desktop, Tablet, dan Mobile).
* **NFR-3.2 (Clean Interface):** UI dashboard dibangun menggunakan Tailwind CSS + Lucide Icons dengan pendekatan minimalis agar navigasi cepat dan intuitif.
* **NFR-3.3 (Drag-and-Drop):** Area *upload* file pada dashboard harus mendukung fitur *drag-and-drop* file `.html`.

### 2.4 Reliability & Deployment

* **NFR-4.1 (Uptime & Edge Network):** Platform dideploy di Vercel untuk memanfaatkan Global Edge CDN dengan jaminan *uptime* tinggi.
* **NFR-4.2 (Storage Limit):** Sistem harus memberikan batas maksimal ukuran file upload per deck sebesar 10MB (cukup besar untuk single-page HTML presentation + inline assets).