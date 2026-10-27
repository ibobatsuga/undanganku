# 💍 Undanganku.id — Platform Website & Template Undangan Pernikahan Digital

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0087EB?style=for-the-badge&logo=github)](https://ibobatsuga.github.io/undanganku/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![HTML5 / CSS3 / Vanilla JS](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-F97316?style=for-the-badge)](https://developer.mozilla.org/)

**Undanganku.id** adalah platform pembuatan undangan pernikahan digital modern berbasis web dengan estetika **Glassmorphism**, tipografi **Neue Montreal**, palet warna **Electric Blue & Peach Gold**, serta dilengkapi dengan **6 template undangan digital interaktif mandiri** dengan fitur buka amplop, audio musik romantis, hitung mundur (countdown), kado cashless, dan buku tamu / RSVP interaktif.

---

## 🌟 Fitur Utama Platform

1. **Glassmorphism Visual System**:
   - Lapisan panel kaca dengan `backdrop-filter: blur(20px - 28px)`.
   - Ambient glowing aura orbs dan efek depth melayang.
   - Micro-interaction 3D lift saat kartu tema di-hover.

2. **Dynamic Slug & Link Generator**:
   - Input langsung tautan undangan personal di Hero Section (`undanganku.id/nama-pasangan`).
   - Integrasi otomatis saat pendaftaran akun baru.

3. **Orbital Payment Integration**:
   - Logo mitra pembayaran digital Indonesia dalam lingkaran presisi dengan *negative space seamless* (QRIS, GoPay, ShopeePay, Flip, Visa, Mastercard).

4. **Interactive Smartphone Simulator**:
   - Pop-up modal berupa bodi smartphone realistis dengan notch dan status bar `09:41`.
   - Menggunakan `<iframe>` interaktif untuk mencoba langsung template undangan yang dipilih secara realtime, lengkap dengan tombol **"Tab Penuh ↗"**.

5. **Skema Harga Transparan**:
   - **Gratis**: Rp 0 / undangan (maksimal 10 undangan).
   - **Premium**: Rp 2.500 / undangan (unlimited, RSVP WhatsApp otomatis, tanpa watermark).
   - **VIP**: Rp 5.000 / undangan (domain kustom `namakamu.com`, QR Code Check-in Resepsi, prioritas 24/7).

---

## 🏛️ 6 Template Undangan Pernikahan Interaktif

Semua template beroperasi secara *client-side* mandiri tanpa ketergantungan server:

| No | Pasangan | Kategori | Tema / Konsep |
|:---:|---|:---:|---|
| 1 | **Cahaya & Muhammad** | **VIP** | Syar'i Modern Masjid, Nuansa Sage Botanical & Kaligrafi Arab |
| 2 | **Susilo & Dewi** | **Gratis** | Adat Jawa Tradisional, Ukiran Gunungan Wayang & Beskap Batik |
| 3 | **Dita & Santo** | **Premium** | Adat Sunda Modern, Ronce Melati & Busana Putih Elegan |
| 4 | **Daniel & Donna** | **Gratis** | Rustic Botanical Dahlia Watercolor & Dedaunan Eucalyptus |
| 5 | **Rosa Maria & Daniel Gallego** | **VIP** | Royal Balinese Black & Gold, Payas Agung & Griya Mandala |
| 6 | **Dewi & Angga** | **Gratis** | Minimalist Modern Pastel Peach & Gold Ornament Frame |

### ⚡ Kemampuan Setiap Template:
- ✉️ **Parameter Tamu Dinamis**: Cukup tambahkan `?to=Nama%20Tamu` pada URL.
- 🎉 **Buka Amplop & Confetti**: Layar cover sambutan dengan animasi pembuka dan semburan confetti keemasan.
- 🎵 **Floating Music Player**: Musik romantis otomatis berputar dengan pemutar piringan hitam (vinyl) melayang.
- ⏳ **Live Countdown Timer**: Hitung mundur hari, jam, menit, dan detik menuju akad/resepsi.
- 💳 **Cashless Wallet**: Kotak rekening multi-bank (BCA, Mandiri, BSI, BRI, BNI) dengan fitur 1-klik salin nomor rekening dan toast feedback.
- 📝 **RSVP & Buku Tamu Interaktif**: Formulir konfirmasi kehadiran dan kirim ucapan doa restu yang tersimpan di `localStorage` per template, lengkap dengan fitur love (❤️ like) komentar.

---

## 📁 Struktur Folder

```text
undanganku/
├── index.html                     # Landing page utama Undanganku.id
├── styles.css                     # Desain Glassmorphism, Neue Montreal & responsivitas
├── script.js                      # Interaktivitas slider, tab, modal, dan simulator
├── .gitignore
├── README.md
├── assets/
│   ├── payments/                  # Logo pembayaran resmi (QRIS, GoPay, ShopeePay, Flip, Visa, Mastercard)
│   └── templates/                 # Foto pratinjau 6 template undangan
└── templates/                     # Direktori 6 template undangan interaktif
    ├── cahaya/                    # Template VIP Cahaya & Muhammad
    │   └── index.html
    ├── susilo/                    # Template Gratis Susilo & Dewi
    │   └── index.html
    ├── dita/                      # Template Premium Dita & Santo
    │   └── index.html
    ├── daniel/                    # Template Gratis Daniel & Donna
    │   └── index.html
    ├── rosamaria/                 # Template VIP Rosa Maria & Daniel Gallego
    │   └── index.html
    ├── dewi/                      # Template Gratis Dewi & Angga
    │   └── index.html
    └── assets/                    # Shared assets untuk template undangan
        ├── template-core.css      # Desain inti mobile-first undangan
        ├── template-core.js       # Core logic (?to=, confetti, audio, rsvp)
        └── music/                 # Audio instrumen romantis (pure-love.mp3)
```

---

## 🚀 Menjalankan Secara Lokal

Clone repositori ini dan buka dengan web server lokal:

```bash
# Clone repository
git clone https://github.com/ibobatsuga/undanganku.git
cd undanganku

# Jalankan server lokal (misalnya Python 3)
python3 -m http.server 5173

# Buka di browser:
# http://127.0.0.1:5173/
```

Untuk menguji nama tamu pada template tertentu:
- `http://127.0.0.1:5173/templates/cahaya/?to=Bapak%20Joko%20%26%20Keluarga`
- `http://127.0.0.1:5173/templates/rosamaria/?to=Tamu%20Kehormatan`

---

## 🌐 Deploy ke Hosting / Web Server

1. Download atau buat ZIP dari repositori ini.
2. Upload file ZIP ke folder `public_html` di cPanel atau hosting Anda.
3. Ekstrak langsung di direktori root.
4. Semua halaman web dan template undangan langsung aktif seketika tanpa perlu setup database.

---

## 📄 Lisensi

Dilisensikan di bawah [MIT License](LICENSE).
© 2026 PT ENRICO MULYA SEJAHTERA. All rights reserved.
