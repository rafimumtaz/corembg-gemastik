# CoreMBG Backend

Backend API for Makan Bergizi Gratis (MBG) System built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## Tech Stack
- Node.js & Express.js
- TypeScript & ES Modules
- PostgreSQL & Prisma ORM
- Zod for Validation
- Multer for File Uploads

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables:
   Copy `.env.example` to `.env` and fill in your details, including `DATABASE_URL`.

3. Database Migration & Seeding:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   npm run prisma:seed
   ```

4. Run locally:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Vercel Deployment

This project is compatible with Vercel deployment. 

1. Ensure your PostgreSQL database is hosted externally (e.g., Supabase, Neon).
2. Configure Environment Variables in Vercel.
3. Deploy via Vercel CLI or GitHub Integration.

Vercel will use `api/index.ts` and `vercel.json` to handle the serverless functions.
