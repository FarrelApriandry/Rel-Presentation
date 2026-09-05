
# 📄 Software Design Document (SDD)

**Project Name:** AI Deck Presenter (MVP)

**Author:** Rel & Gem

**Version:** 1.0

**Target Deployment:** Vercel

---

## 1. System Overview & Scope (Gambaran Umum)

### 1.1 Purpose

Sistem ini dirancang sebagai platform terpusat untuk menyimpan, mengelola, dan menampilkan slide presentasi interaktif berbasis **HTML + CSS + JS** yang di-generate menggunakan AI (Gemini/ChatGPT).

### 1.2 MVP Scope (Cakupan Fitur Utama)

* **Authentication:** Login khusus admin/owner via Supabase Auth.
* **Deck Management (Dashboard):** Upload file `.html` presentasi, input metadata (judul, slug, prompt AI), serta lihat list presentasi yang tersimpan.
* **Storage:** Penyimpanan file `.html` interaktif di Supabase Storage.
* **Presentation Viewer (Public/Private):** Halaman viewer bersih (*distraction-free*) menggunakan `iframe` tersandbox dengan fitur **1-Click Fullscreen**.

---

## 2. System Architecture & Tech Stack

```text
[ Browser Client ]
       │
       ├── Router & SSR Page  ──> [ Astro Engine ] (Public Routes: /p/[slug])
       └── Interactive UI     ──> [ React / TSX ]  (Dashboard & Upload Components)
                                       │
                                       ▼
                              [ Supabase Backend ]
                               ├── Auth (Owner Login)
                               ├── Postgres DB (Metadata & Slugs)
                               └── Object Storage (Bucket: `decks/`)

```

### 2.1 Tech Stack Table

| Layer | Technology | Usage |
| --- | --- | --- |
| **Frontend Framework** | **Astro 5.x** | Static Site Generation & SSR Routing |
| **Interactive UI** | **React (TSX)** | Astro Islands untuk state Dashboard, Modal, & Dropzone |
| **Styling & Icons** | **Tailwind CSS v4 + Lucide Icons** | Utility-first styling & icon set |
| **Animation** | **Framer Motion** | Micro-interactions pada UI Dashboard & Modal |
| **Database & Auth** | **Supabase Postgres + Auth** | Relational Database & Authentication System |
| **File Storage** | **Supabase Storage** | Public/Private Bucket penampung file `.html` |
| **Hosting** | **Vercel** | Deployment & Edge Network |

---

## 3. Database Schema & Storage Architecture

### 3.1 Database Table: `presentations`

```sql
-- Create Presentations Table
create table public.presentations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text,
  file_path text not null, -- Path di storage bucket, contoh: "decks/pasar-bubrah-v1.html"
  ai_prompt text,          -- Catatan prompt AI yang digunakan (opsional)
  is_public boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.presentations enable row level security;

-- RLS Policies
-- 1. Owner bisa membaca, menambah, mengubah, dan menghapus data miliknya
create policy "Owner CRUD Access" on public.presentations
  for all using (auth.uid() = user_id);

-- 2. Public bisa membaca jika is_public = true
create policy "Public Read Access" on public.presentations
  for select using (is_public = true);

```

### 3.2 Supabase Storage Configuration

* **Bucket Name:** `decks`
* **Access Level:** Public (Read-only access untuk publik agar file `.html` bisa dipanggil via `iframe`).
* **File Structure:** `decks/{user_id}/{slug}.html`

---

## 4. Component & Page Specifications

### 4.1 Page Routes

#### 1. `/login` (Public / Guest Only)

* **Deskripsi:** Form login sederhana dengan Supabase Auth (Email + Password).
* **Behavior:** Mengarahkan ke `/dashboard` setelah sukses login.

#### 2. `/dashboard` (Protected Route / Owner Only)

* **Deskripsi:** Panel utama manajemen presentasi.
* **Komponen:**
* **Header:** Title + Logout Button.
* **Upload Action Button / Modal:** Modal berisi Dropzone file `.html` + Form metadata (Title, Slug, AI Prompt Notes).
* **Presentation Grid:** Kartu-kartu daftar presentasi yang menampilkan:
* Judul & Tanggal Buat.
* Status (`Public` / `Private`).
* Tombol *View* (buka viewer), *Copy Link*, dan *Delete*.





#### 3. `/p/[slug]` (Public / Presentation Viewer)

* **Deskripsi:** Route viewer utama dengan tampilan *distraction-free*.
* **Layout:**
* `<iframe>` dengan width/height `100vw`/`100vh`.
* **Floating Control Bar (Overlay Pojok Kanan Bawah):**
* Tombol **Fullscreen** (`F11` / HTML5 Fullscreen API).
* Tombol **Share / Copy Link**.





---

## 5. Security & Zero-Trust Isolation

Karena file HTML + JS di-generate oleh AI dan di-upload pengguna, penting untuk mengisolasi eksekusi JavaScript agar tidak memiliki akses ke cookie/session token dari dashboard utama.

### 5.1 Sandboxed iFrame Policy

Di dalam halaman `/p/[slug]`, `iframe` dirender dengan atribut keamanan ketat:

```tsx
<iframe
  src={publicStorageUrl}
  title={presentation.title}
  className="w-screen h-screen border-0"
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
  allow="fullscreen"
/>

```

---

## 6. Implementation Roadmap

* [ ] **Phase 1: Project Initialization & Supabase Setup**
* Setup Astro project dengan integrasi `@astrojs/react` dan Tailwind CSS.
* Setup project Supabase, buat tabel `presentations` beserta RLS & Storage Bucket `decks`.


* [ ] **Phase 2: Authentication & Layout**
* Implementasi halaman `/login` & Middleware auth guard untuk `/dashboard`.


* [ ] **Phase 3: Dashboard & File Upload Engine**
* Buat komponen Upload (React Dropzone + Supabase Storage upload + Insert DB Metadata).
* Buat komponen Grid/Card list presentasi dengan Framer Motion animations.


* [ ] **Phase 4: Viewer Page & Fullscreen Feature**
* Implementasi route Astro `/p/[slug]`.
* Tambahkan Floating Overlay untuk kontrol Fullscreen & Share link.


* [ ] **Phase 5: Deployment**
* Config environment variables di Vercel (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`).
* Deploy & Testing.