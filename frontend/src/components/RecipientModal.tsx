'use client';

import { useState } from 'react';
import { HeartHandshake, X, Plus } from 'lucide-react';

interface RecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecipientModal({ isOpen, onClose, onSuccess }: RecipientModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('PANTI');
  const [capacity, setCapacity] = useState('50');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('-7.44');
  const [longitude, setLongitude] = useState('112.72');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          capacity: parseInt(capacity, 10),
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setName('');
        setAddress('');
        onSuccess();
        onClose();
      } else {
        alert(json.message || 'Gagal mendaftarkan penerima baru.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Registrasi Penerima Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Panti / Posyandu</label>
            <input
              type="text"
              required
              placeholder="Panti Asuhan Kasih Ibu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="PANTI">PANTI</option>
                <option value="POSYANDU">POSYANDU</option>
                <option value="SEKOLAH">SEKOLAH</option>
                <option value="PENERIMA">PENERIMA LAIN</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kapasitas (Orang)</label>
              <input
                type="number"
                required
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Lengkap</label>
            <textarea
              required
              rows={2}
              placeholder="Jl. Merdeka No. 10, Sidoarjo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 text-sm font-semibold text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>Simpan Penerima</span>
          </button>
        </form>
      </div>
    </div>
  );
}
