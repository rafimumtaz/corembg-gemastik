# CoreMBG - Matching API (Haversine Logic)

Fungsi utama dari sistem CoreMBG ini berada di sistem *Matching*. Tugas utamanya adalah memastikan makanan dari Dapur disalurkan ke Penerima terdekat dengan cara yang paling efisien, dan menolak makanan yang akan basi.

## Algoritma Haversine
Backend menggunakan Haversine Formula untuk mengukur jarak (*Great-circle distance*) antara *latitude* dan *longitude* Dapur dan Penerima.

## Endpoints

### 1. Find Match for Recipient
- **Route:** `POST /api/matching/find`
- **Cara Kerja:**
  1. Frontend mengirim ID Penerima.
  2. Backend memeriksa koordinat Penerima tersebut.
  3. Backend menarik daftar makanan `AVAILABLE` yang `safeUntil` nya belum habis.
  4. Backend menghitung jarak menggunakan Haversine dari titik koordinat masing-masing Dapur ke titik koordinat Penerima.
  5. Makanan yang jarak dapurnya berada di dalam radius toleransi maksimum (contoh: 5 KM) akan dipilih dan diurutkan dari yang paling dekat.
- **Payload:**
  ```json
  {
    "recipientId": "uuid-recipient",
    "maxRadiusKm": 5.0
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "matchFound": true,
      "foodId": "uuid-food",
      "kitchenName": "Dapur MBG Sidoarjo",
      "distanceKm": 1.25,
      "estimatedTravelTimeMinutes": 15
    }
  }
  ```
