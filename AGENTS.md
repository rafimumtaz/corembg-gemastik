Anda adalah senior backend engineer. Bangun backend API production-ready untuk sistem distribusi makanan MBG (Makan Bergizi Gratis).

TUJUAN UTAMA
Membangun REST API backend yang dapat:
1. Mengelola data Dapur MBG.
2. Mengelola stok makanan/menu MBG.
3. Mengelola data penerima/panti.
4. Menerima input makanan yang selesai dimasak.
5. Menghitung batas waktu aman makanan berdasarkan waktu selesai masak.
6. Melakukan matching penerima/panti berdasarkan radius terdekat.
7. Menerima foto label makanan dan melakukan OCR untuk membaca informasi seperti nama makanan dan waktu/tanggal.
8. Siap di-deploy ke Vercel.
9. Backend harus menggunakan TypeScript + Express + PostgreSQL + Prisma ORM + ES Modules.

==================================================
TECH STACK WAJIB
==================================================

- Node.js
- Express.js
- TypeScript
- ES Modules
- PostgreSQL
- Prisma ORM
- REST API
- dotenv untuk environment variables
- Vercel deployment support
- Gunakan npm
- Gunakan strict TypeScript
- Gunakan ESLint/Prettier jika diperlukan

Untuk OCR:
- Buat abstraction/service OCR agar provider OCR mudah diganti.
- Gunakan OCR API/library yang sederhana dan memiliki free tier jika memungkinkan.
- API key OCR harus disimpan di environment variable.
- Jangan hardcode API key.
- Jika OCR provider belum tersedia, buat mock/fallback service agar backend tetap dapat dijalankan secara lokal.

==================================================
STRUKTUR PROJECT
==================================================

Gunakan struktur modular seperti:

src/
├── config/
├── controllers/
├── routes/
├── services/
├── modules/
│   ├── kitchen/
│   ├── food/
│   ├── recipient/
│   ├── matching/
│   └── ocr/
├── middleware/
├── utils/
├── types/
├── app.ts
└── server.ts

prisma/
├── schema.prisma
└── seed.ts

api/
atau struktur yang kompatibel dengan Vercel jika diperlukan.

Tambahkan:
- package.json
- tsconfig.json
- .env.example
- .gitignore
- vercel.json jika diperlukan
- README.md

==================================================
DATABASE DESIGN
==================================================

Gunakan PostgreSQL + Prisma.

Buat minimal 3 tabel utama:

1. Dapur MBG / Kitchen

Field minimal:
- id
- name
- address
- latitude
- longitude
- createdAt
- updatedAt

2. Stok Makanan MBG / FoodStock

Field minimal:
- id
- kitchenId
- menuName
- portionCount
- cookedAt
- safeUntil
- status
- createdAt
- updatedAt

Relasi:
Kitchen memiliki banyak FoodStock.

Status makanan minimal:
- AVAILABLE
- MATCHED
- EXPIRED
- DISTRIBUTED

3. Penerima/Panti / Recipient

Field minimal:
- id
- name
- type
- address
- latitude
- longitude
- capacity
- createdAt
- updatedAt

type minimal:
- PANTI
- PENERIMA

Tambahkan index pada field yang sering digunakan untuk query.

Gunakan UUID atau CUID sebagai primary key.

==================================================
FOOD TIME-CRITICAL LOGIC
==================================================

Buat service:

calculateSafeUntil(cookedAt)

Default aturan:
safeUntil = cookedAt + 3 jam

Contoh:

cookedAt:
2026-08-08T10:00:00+07:00

safeUntil:
2026-08-08T13:00:00+07:00

Jangan hardcode angka 3 di banyak tempat.

Gunakan configuration:

SAFE_FOOD_DURATION_HOURS=3

Tambahkan validasi:
- cookedAt harus berupa tanggal valid.
- safeUntil harus dihitung oleh backend.
- Client tidak boleh bebas menentukan safeUntil.
- Makanan dianggap EXPIRED jika current time >= safeUntil.

==================================================
LOCATION / RADIUS MATCHING
==================================================

Buat modul matching.

Input:
- kitchen latitude
- kitchen longitude
- radius dalam kilometer

Cari Recipient/Panti yang berada dalam radius tertentu dari lokasi dapur.

Gunakan formula Haversine untuk menghitung jarak jika PostgreSQL/PostGIS tidak digunakan.

Contoh:

distance = haversine(
    kitchenLat,
    kitchenLng,
    recipientLat,
    recipientLng
)

API harus dapat mengembalikan:

{
  "recipientId": "...",
  "name": "Panti A",
  "distanceKm": 2.35
}

Urutkan berdasarkan:
1. distance terdekat
2. recipient yang masih membutuhkan makanan

Tambahkan parameter:

radiusKm

Default:
radiusKm = 5

Jangan menerima radius negatif.

==================================================
TIME-CRITICAL MATCHING
==================================================

Buat endpoint untuk melakukan matching makanan dengan penerima.

Contoh:

POST /api/matching/find

Request:

{
  "foodStockId": "xxx",
  "radiusKm": 5
}

Backend harus:

1. Ambil FoodStock.
2. Pastikan status AVAILABLE.
3. Cek apakah makanan sudah expired.
4. Ambil Kitchen dari FoodStock.
5. Cari Recipient terdekat berdasarkan koordinat.
6. Filter recipient berdasarkan radius.
7. Urutkan dari jarak terdekat.
8. Return kandidat matching.
9. Jangan mengubah status menjadi MATCHED hanya dengan endpoint pencarian.
10. Buat endpoint terpisah untuk melakukan konfirmasi matching.

Response contoh:

{
  "success": true,
  "data": {
    "food": {
      "id": "...",
      "menuName": "Nasi Ayam",
      "portionCount": 100,
      "cookedAt": "...",
      "safeUntil": "..."
    },
    "matches": [
      {
        "recipientId": "...",
        "name": "Panti A",
        "distanceKm": 1.25,
        "capacity": 120
      }
    ]
  }
}

==================================================
FOOD API
==================================================

Buat endpoint:

POST /api/foods

Untuk memasukkan makanan yang baru selesai dimasak.

Request:

{
  "kitchenId": "xxx",
  "menuName": "Nasi Ayam",
  "portionCount": 100,
  "cookedAt": "2026-08-08T10:00:00+07:00"
}

Backend otomatis menghitung:

safeUntil = cookedAt + SAFE_FOOD_DURATION_HOURS

Response:

{
  "success": true,
  "data": {
    "id": "...",
    "menuName": "Nasi Ayam",
    "portionCount": 100,
    "cookedAt": "...",
    "safeUntil": "...",
    "status": "AVAILABLE"
  }
}

Buat juga:

GET /api/foods
GET /api/foods/:id
PATCH /api/foods/:id/status
DELETE /api/foods/:id

Tambahkan filter:

GET /api/foods?status=AVAILABLE

GET /api/foods?expired=false

==================================================
KITCHEN API
==================================================

Buat:

POST /api/kitchens
GET /api/kitchens
GET /api/kitchens/:id
PATCH /api/kitchens/:id
DELETE /api/kitchens/:id

Request:

{
  "name": "Dapur MBG Sidoarjo",
  "address": "....",
  "latitude": -7.45,
  "longitude": 112.71
}

==================================================
RECIPIENT API
==================================================

Buat:

POST /api/recipients
GET /api/recipients
GET /api/recipients/:id
PATCH /api/recipients/:id
DELETE /api/recipients/:id

Request:

{
  "name": "Panti A",
  "type": "PANTI",
  "address": "...",
  "latitude": -7.44,
  "longitude": 112.72,
  "capacity": 100
}

==================================================
OCR MODULE
==================================================

Buat module:

src/modules/ocr/

Tujuan:
Menerima foto label makanan Dapur MBG dan membaca:

- nama menu makanan
- tanggal
- waktu masak
- teks lain yang relevan

Buat endpoint:

POST /api/ocr

Content-Type:
multipart/form-data

Field:
image

Response contoh:

{
  "success": true,
  "data": {
    "rawText": "NASI AYAM\nDIBUAT: 08-08-2026 10:15",
    "menuName": "NASI AYAM",
    "cookedAt": "2026-08-08T10:15:00+07:00",
    "confidence": 0.91
  }
}

PENTING:
- Jangan menganggap hasil OCR selalu benar.
- Jika waktu tidak ditemukan, cookedAt harus null.
- rawText tetap dikembalikan.
- Buat parser terpisah untuk mengekstrak tanggal/waktu dari rawText.
- Support beberapa format waktu sederhana, misalnya:
  08-08-2026 10:15
  08/08/2026 10:15
  2026-08-08 10:15
  10:15
- Jika hanya ada jam tanpa tanggal, gunakan tanggal saat request dengan timezone yang dikonfigurasi.
- Gunakan timezone Asia/Jakarta.

Buat OCR provider abstraction:

interface OCRService {
  extractText(imagePath: string): Promise<OCRResult>;
}

Dengan demikian provider OCR dapat diganti tanpa mengubah controller.

==================================================
CREATE FOOD FROM OCR
==================================================

Jika memungkinkan, buat endpoint:

POST /api/foods/from-ocr

multipart/form-data

Field:
- image
- kitchenId
- portionCount

Flow:

1. Upload image.
2. Jalankan OCR.
3. Extract menuName.
4. Extract cookedAt.
5. Validasi hasil.
6. Hitung safeUntil.
7. Simpan FoodStock.
8. Return hasil OCR + data FoodStock.

Jika cookedAt tidak ditemukan:
- jangan membuat data makanan secara otomatis,
- return error yang jelas agar user memasukkan waktu secara manual.

==================================================
VALIDATION
==================================================

Gunakan validation library seperti Zod.

Validasi:
- UUID/CUID
- menuName tidak boleh kosong
- portionCount > 0
- latitude antara -90 sampai 90
- longitude antara -180 sampai 180
- radiusKm > 0
- cookedAt harus valid
- image harus memiliki format yang didukung
- ukuran file dibatasi

Jangan mempercayai input dari client.

==================================================
ERROR HANDLING
==================================================

Buat global error handler.

Format response error konsisten:

{
  "success": false,
  "error": {
    "code": "FOOD_NOT_FOUND",
    "message": "Food stock not found"
  }
}

Gunakan HTTP status code yang benar:
- 200 OK
- 201 Created
- 400 Bad Request
- 404 Not Found
- 409 Conflict
- 422 Unprocessable Entity
- 500 Internal Server Error

Jangan expose stack trace pada production.

==================================================
API RESPONSE FORMAT
==================================================

Gunakan format konsisten:

Success:

{
  "success": true,
  "data": {}
}

Error:

{
  "success": false,
  "error": {
    "code": "...",
    "message": "..."
  }
}

==================================================
SECURITY BASIC
==================================================

Implementasikan minimal:
- Helmet
- CORS configuration
- request body size limit
- upload file size limit
- validasi input
- environment variables
- jangan expose database credentials
- jangan expose OCR API key
- jangan commit .env

Jika authentication belum diperlukan untuk MVP, jangan membuat sistem auth kompleks.
Tetapi struktur project harus mudah ditambahkan JWT/Auth di kemudian hari.

==================================================
DATABASE / PRISMA
==================================================

Buat:

prisma/schema.prisma

Buat migration:

npx prisma migrate dev

Buat seed:

prisma/seed.ts

Seed minimal:
- 2 Dapur MBG
- 5 makanan
- 5 Panti/Penerima

Gunakan koordinat dummy yang valid.

Tambahkan Prisma client singleton agar tidak membuat terlalu banyak connection.

==================================================
ENVIRONMENT VARIABLES
==================================================

Buat .env.example:

DATABASE_URL="postgresql://..."
SAFE_FOOD_DURATION_HOURS="3"
DEFAULT_MATCHING_RADIUS_KM="5"
TIMEZONE="Asia/Jakarta"
OCR_API_KEY=""
OCR_PROVIDER=""
NODE_ENV="development"

Jangan memasukkan credential asli.

==================================================
VERCEL DEPLOYMENT
==================================================

Backend harus dapat di-deploy ke Vercel.

Pastikan:
- TypeScript dapat di-build.
- Express compatible dengan Vercel serverless runtime.
- Tidak bergantung pada local persistent filesystem.
- File upload OCR tidak boleh diasumsikan tersimpan permanen di server.
- Database menggunakan PostgreSQL external.
- Prisma compatible dengan deployment Vercel.
- Environment variables dapat dikonfigurasi di Vercel.

Buat konfigurasi deployment yang diperlukan.

Tambahkan script:

npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

==================================================
HEALTH CHECK
==================================================

Buat:

GET /api/health

Response:

{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "...",
    "service": "mbg-backend"
  }
}

==================================================
DOCUMENTATION
==================================================

Buat README.md yang menjelaskan:

1. Project overview
2. Tech stack
3. Installation
4. Environment variables
5. PostgreSQL setup
6. Prisma migration
7. Seed database
8. Run development server
9. Build production
10. Deploy ke Vercel
11. API endpoints
12. Contoh request/response
13. Cara menggunakan OCR
14. Cara testing API

Buat juga dokumentasi endpoint yang mudah dipahami oleh frontend developer.

==================================================
TESTING
==================================================

Buat unit/integration test minimal untuk:

1. calculateSafeUntil()
2. Haversine distance calculation
3. radius filtering
4. expired food detection
5. OCR datetime parser
6. POST /api/foods
7. POST /api/matching/find

Pastikan edge cases ditangani.

Contoh:
- makanan sudah expired
- radius 0
- koordinat invalid
- portionCount negatif
- OCR tidak menemukan waktu
- foodStock tidak ditemukan
- tidak ada recipient dalam radius

==================================================
QUALITY REQUIREMENTS
==================================================

Kode harus:
- modular
- readable
- maintainable
- strongly typed
- tidak menggunakan any kecuali benar-benar diperlukan
- menggunakan async/await
- memiliki error handling
- memiliki separation antara controller, service, repository/database layer jika diperlukan
- tidak mencampur business logic dengan route
- mudah dikembangkan menjadi production system

Jangan membuat implementasi terlalu kompleks.
Prioritaskan MVP yang benar-benar berjalan.

==================================================
FINAL DELIVERABLE
==================================================

Setelah selesai, hasil akhir harus memiliki:

[ ] Express + TypeScript
[ ] ES Modules
[ ] PostgreSQL
[ ] Prisma ORM
[ ] Database schema
[ ] Seed database
[ ] Kitchen API
[ ] Food API
[ ] Recipient API
[ ] Time-critical food expiration logic
[ ] Haversine radius matching
[ ] Matching API
[ ] OCR module
[ ] OCR datetime parser
[ ] Create food from OCR
[ ] Validation
[ ] Global error handling
[ ] Health check
[ ] Basic security
[ ] Tests
[ ] .env.example
[ ] README
[ ] Vercel deployment support

Jangan hanya memberikan contoh kode atau pseudocode.

Implementasikan seluruh struktur project dan kode yang diperlukan sehingga project dapat langsung:

npm install
npx prisma generate
npm run dev

dan API dapat digunakan.

Sebelum menyelesaikan pekerjaan:
1. Pastikan TypeScript berhasil build.
2. Pastikan Prisma schema valid.
3. Pastikan seluruh import ES Modules benar.
4. Pastikan endpoint utama dapat dijalankan.
5. Pastikan tidak ada secret/API key yang hardcoded.
6. Pastikan deployment Vercel dapat dilakukan.
7. Tampilkan struktur folder final.
8. Tampilkan daftar endpoint final.
9. Tampilkan cara menjalankan project secara lokal.
10. Tampilkan langkah deployment ke Vercel.
