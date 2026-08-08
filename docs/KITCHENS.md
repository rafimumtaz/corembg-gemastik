# CoreMBG - Kitchens API

API ini menangani pendaftaran dan pengelolaan Dapur (Kitchen) yang memasak makanan bergizi. Setiap dapur memiliki lokasi koordinat (latitude, longitude) yang krusial untuk fitur Haversine Matching.

## Endpoints

### 1. Register Kitchen
- **Route:** `POST /api/kitchens`
- **Cara Kerja:** Mendaftarkan dapur baru beserta titik lokasinya.
- **Payload:**
  ```json
  {
    "name": "Dapur MBG Sidoarjo",
    "address": "Jl. Pahlawan No. 1",
    "latitude": -7.45,
    "longitude": 112.71
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "eec02bd3-...",
      "name": "Dapur MBG Sidoarjo",
      "createdAt": "2026-08-08T08:30:29.967Z"
    }
  }
  ```

### 2. List All Kitchens
- **Route:** `GET /api/kitchens`
- **Cara Kerja:** Mengambil semua daftar dapur. Digunakan oleh admin untuk memantau titik-titik dapur.
- **Response:** Array dari object `Kitchen`.

### 3. Get / Update / Delete
- **GET** `/api/kitchens/:id` : Menarik profil 1 dapur.
- **PATCH** `/api/kitchens/:id` : Mengupdate data dapur (misal pindah alamat).
- **DELETE** `/api/kitchens/:id` : Menghapus operasional dapur.
