import { config } from '../config/index.js';

export interface OCRResult {
  rawText: string;
  menuName: string | null;
  cookedAt: Date | null;
  confidence: number;
}

export interface OCRService {
  extractText(imagePath: string): Promise<OCRResult>;
}

export class MockOCRService implements OCRService {
  async extractText(imagePath: string): Promise<OCRResult> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For mocking purposes, return a hardcoded valid result
    return {
      rawText: "NASI AYAM\nDIBUAT: 08-08-2026 10:15",
      menuName: "NASI AYAM",
      cookedAt: new Date("2026-08-08T10:15:00+07:00"),
      confidence: 0.91,
    };
  }
}

let ocrServiceInstance: OCRService;

if (config.ocrProvider === 'mock') {
  ocrServiceInstance = new MockOCRService();
} else {
  // Add actual OCR provider here when available
  ocrServiceInstance = new MockOCRService();
}

export const ocrService = ocrServiceInstance;
