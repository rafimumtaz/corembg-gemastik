import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

describe('API Endpoints', () => {
  beforeAll(async () => {
    // Optionally clean or seed DB specifically for tests if needed
  });

  describe('GET /api/health', () => {
    it('should return health check data', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('GET /api/kitchens', () => {
    it('should list kitchens', async () => {
      const res = await request(app).get('/api/kitchens');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/foods?status=AVAILABLE', () => {
    it('should list available foods', async () => {
      const res = await request(app).get('/api/foods?status=AVAILABLE');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
