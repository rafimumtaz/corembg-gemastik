'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { processOcr } from '@/lib/api';

interface OcrCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOcrSuccess: (parsedDateIso: string, rawText?: string) => void;
}

export const OcrCameraModal: React.FC<OcrCameraModalProps> = ({
  isOpen,
  onClose,
  onOcrSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'FILE'>('CAMERA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('WebRTC camera not available or permission denied:', err);
      setCameraActive(false);
      setError('Kamera tidak dapat diakses. Silakan gunakan opsi Unggah Berkas Foto.');
      setActiveTab('FILE');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewImage(dataUrl);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          handleOcrUpload(file);
        }
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      handleOcrUpload(file);
    }
  };

  const handleOcrUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await processOcr(formData);
      onOcrSuccess(result.parsedDate, result.extractedText);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses OCR dari gambar.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/50 px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Scan Label Waktu Masak (OCR)</h3>
              <p className="text-xs text-slate-500">Ambil foto atau unggah label box masakan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button
            onClick={() => {
              setActiveTab('CAMERA');
              setPreviewImage(null);
            }}
            className={`flex flex-1 items-center justify-center space-x-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'CAMERA'
                ? 'bg-white text-blue-600 shadow-sm shadow-slate-200 ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Kamera Langsung</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('FILE');
              setPreviewImage(null);
            }}
            className={`flex flex-1 items-center justify-center space-x-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'FILE'
                ? 'bg-white text-blue-600 shadow-sm shadow-slate-200 ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Unggah Berkas</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'CAMERA' ? (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                {!cameraActive && (
                  <div className="p-6 text-center text-slate-400">
                    <Camera className="mx-auto h-10 w-10 mb-2 opacity-50" />
                    <p className="text-xs">Mengaktifkan kamera...</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <button
                onClick={capturePhoto}
                disabled={loading || !cameraActive}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menganalisis Teks OCR...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Potret & Deteksi Waktu</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 transition-colors hover:bg-blue-50/70">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="h-full w-full object-contain p-2 rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <Upload className="mb-2 h-8 w-8 text-blue-500" />
                    <p className="mb-1 text-xs font-semibold text-slate-700">Klik untuk memilih foto label masakan</p>
                    <p className="text-[11px] text-slate-400">PNG, JPG, JPEG (Maks. 5MB)</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {loading && (
                <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sedang memproses OCR label...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
