import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  safeFoodDurationHours: parseInt(process.env.SAFE_FOOD_DURATION_HOURS || '3', 10),
  defaultMatchingRadiusKm: parseFloat(process.env.DEFAULT_MATCHING_RADIUS_KM || '5'),
  timezone: process.env.TIMEZONE || 'Asia/Jakarta',
  ocrApiKey: process.env.OCR_API_KEY || '',
  ocrProvider: process.env.OCR_PROVIDER || 'mock',
  nodeEnv: process.env.NODE_ENV || 'development'
};
