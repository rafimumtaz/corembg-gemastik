# CoreMBG - Foods API

API ini menangani pencatatan stok makanan dari setiap Dapur. Fitur krusial dari API ini adalah penghitungan otomatis waktu kedaluwarsa (`safeUntil`) berdasarkan `cookedAt`.

## Cara Kerja Expiration (safeUntil)
Setiap kali makanan di-input, sistem akan mengambil waktu `cookedAt` dan menambahkan konstanta `SAFE_FOOD_DURATION_HOURS` (misalnya +3 jam atau +4 jam). Jika waktu saat ini melebih `safeUntil`, maka status makanan dianggap *Expired*.

## Endpoints

### 1. Create Food Stock
- **Route:** `POST /api/foods`
- **Cara Kerja:** Dapur melaporkan bahwa mereka selesai memasak sejumlah porsi makanan.
- **Payload:**
  ```json
  {
    "kitchenId": "uuid-dapur",
    "menuName": "Nasi Ayam Geprek",
    "portionCount": 150,
    "cookedAt": "2026-08-08T08:00:00.000Z"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-food",
      "menuName": "Nasi Ayam Geprek",
      "safeUntil": "2026-08-08T11:00:00.000Z",
      "status": "AVAILABLE"
    }
  }
  ```

### 2. List Foods
- **Route:** `GET /api/foods`
- **Query Parameter:** `?status=AVAILABLE` atau `?expired=false`
- **Cara Kerja:** Mengembalikan daftar makanan. Bisa difilter hanya makanan yang `AVAILABLE` dan belum melewati waktu `safeUntil`.

### 3. Update Food Status
- **Route:** `PATCH /api/foods/:id/status`
- **Cara Kerja:** Mengubah status dari `AVAILABLE` ke `MATCHED` atau `DISTRIBUTED`. Biasanya dipanggil setelah proses *matching* berhasil.

### 4. Create Food from OCR
- **Route:** `POST /api/foods/from-ocr`
- **Cara Kerja:** Menggunakan multipart/form-data (upload file gambar label masakan). OCR mendeteksi waktu masakan dan otomatis memasukkannya sebagai `cookedAt` (lihat dokumentasi OCR).
