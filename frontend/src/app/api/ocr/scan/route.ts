import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Return structured OCR result for instant AI camera scan
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const cookedAtIso = d.toISOString().slice(0, 16);

    const mockOcrResult = {
      rawText: "MENU: NASI AYAM GEPREK MBG\nDIBUAT: " + cookedAtIso,
      menuName: "NASI AYAM GEPREK MBG",
      cookedAt: cookedAtIso,
      confidence: 0.94,
    };

    return NextResponse.json({
      success: true,
      data: mockOcrResult,
    });
  } catch (error: any) {
    console.error('Error processing OCR:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'OCR process failed' } },
      { status: 500 }
    );
  }
}
