# CoreMBG - Recipients API

API ini menangani pendaftaran dan manajemen Penerima (Recipients), yang bisa berupa Panti Asuhan (tipe: `PANTI`) atau Penerima Individu/Kelompok Kecil (tipe: `PENERIMA`).

## Endpoints

### 1. Register Recipient
- **Route:** `POST /api/recipients`
- **Cara Kerja:** Menyimpan data penerima, kapasitas kebutuhan porsi harian, dan titik koordinat untuk mencocokkan (matching) dapur terdekat.
- **Payload:**
  ```json
  {
    "name": "Panti Asuhan A",
    "type": "PANTI",
    "address": "Jl. Merdeka No. 10",
    "latitude": -7.44,
    "longitude": 112.72,
    "capacity": 100
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-recipient",
      "name": "Panti Asuhan A",
      "capacity": 100,
      "createdAt": "2026-08-08T08:30:29.988Z"
    }
  }
  ```

### 2. Get / Update / Delete
- **GET** `/api/recipients` : List semua panti / penerima.
- **GET** `/api/recipients/:id` : Detail profil penerima.
- **PATCH** `/api/recipients/:id` : Update kapasitas atau pindah titik alamat (latitude, longitude).
- **DELETE** `/api/recipients/:id` : Menghapus data penerima.
