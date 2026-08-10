'use client';

import React, { useState } from 'react';
import { X, MapPin, Plus, Loader2 } from 'lucide-react';
import { createKitchen, Kitchen } from '@/lib/api';

interface KitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newKitchen: Kitchen) => void;
}

export const KitchenModal: React.FC<KitchenModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(-7.45);
  const [longitude, setLongitude] = useState<number>(112.71);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) {
      setError('Nama dapur dan alamat harus diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await createKitchen({
        name,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      onSuccess(created);
      onClose();
      setName('');
      setAddress('');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan dapur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/50 px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900">Registrasi Dapur MBG Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Dapur</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dapur MBG Sidoarjo Central"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Pahlawan No. 12, Sidoarjo"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan Dapur...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Daftarkan Dapur</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
