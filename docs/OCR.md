# CoreMBG - OCR Service API

Modul ini bertujuan untuk membaca stempel/label waktu `Cooked At` dari foto box makanan. Pengurus dapur tidak perlu mengetik manual waktu masak, cukup dengan memotret box makanannya.

## Cara Kerja
1. Klien mengirim foto (Multipart Form-Data) ke server.
2. Server (atau eksternal OCR cloud, dimock di lokal) akan membaca pola text pada gambar.
3. Modul parser akan mencari pola `dd-MM-yyyy HH:mm` atau sejenisnya.
4. Nilai waktu diekstrak dan divalidasi.
5. Makanan didaftarkan menggunakan waktu ekstrak tersebut.

## Endpoints

### 1. Extract Date from Label
- **Route:** `POST /api/ocr`
- **MIME Type:** `multipart/form-data`
- **Field:** `image` (File gambar)
- **Cara Kerja:** Menganalisis gambar dan mereturn string waktu yang berhasil di-parse.
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "extractedText": "Di masak pada: 08-08-2026 08:30",
      "parsedDate": "2026-08-08T08:30:00.000Z"
    }
  }
  ```

> [!NOTE]
> *Di mode development, OCR Service disimulasikan menggunakan regex parser sederhana untuk demonstrasi alur integrasi tanpa perlu memakan biaya API eksternal. Untuk produksi dapat dipasangkan dengan Google Cloud Vision atau Tesseract.*
