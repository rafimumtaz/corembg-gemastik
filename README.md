# CoreMBG Backend

[![MBG CI](https://img.shields.io/badge/MBG-API_Operational-success?style=flat-square)](#)

CoreMBG (Makan Bergizi Gratis) Backend dirancang untuk mengelola, mencatat, dan memantau distribusi logistik makanan dari Dapur-Dapur relawan kepada Penerima/Panti Asuhan, memastikan makanan terdistribusi efisien, sehat, dan tidak melewati batas waktu kelayakan (kedaluwarsa) konsumsi.

Backend ini menonjolkan fitur unggulan seperti **Algoritma Matching Jarak Terdekat (Haversine)** dan otomasi pembacaan stempel waktu kelayakan makanan menggunakan fitur **OCR Labeling**.

# Contributing

- [Submit issues](https://github.com/octaoss/corembg-gemastik/issues) and help verify fixes as they are checked in.
- Review the open PRs.
- Contribute features and fixes.
- Contribute to the documentation.

> [!NOTE]
> Proyek ini menggunakan stack Node.js, Express, TypeScript, dan Prisma. Kami sangat terbuka jika Anda ingin menambahkan provider OCR (seperti Google Cloud Vision) pada abstraksi OCRService kami.

# Documentation

Semua dokumentasi endpoint, kapabilitas, payload, dan cara kerja sistem CoreMBG didokumentasikan di folder `/docs`.

### Guides
- [API Health & Lifecycle](./docs/KITCHENS.md) - *(Start Here)*
- [Manajemen Dapur (Kitchens)](./docs/KITCHENS.md)
- [Pencatatan Logistik & Expiration (Foods)](./docs/FOODS.md)
- [Entitas Penerima Bantuan (Recipients)](./docs/RECIPIENTS.md)
- [Algoritma Radius Haversine (Matching)](./docs/MATCHING.md)
- [Mockup Tesseract / Visi Komputer (OCR)](./docs/OCR.md)

### Deployment
Aplikasi backend ini dirancang _Vercel-ready_ menggunakan Edge Functions dan ES Modules.
- [Konfigurasi Vercel](./vercel.json)
- [Endpoint Utama Serverless](./api/index.ts)

> [!IMPORTANT]
> **Experimental:** Fitur OCR Service saat ini di-mock untuk kepentingan development lokal agar tidak memakan limit biaya API external. Abstraksi sudah tersedia untuk langsung dikoneksikan ke Provider OCR asli untuk production level.

