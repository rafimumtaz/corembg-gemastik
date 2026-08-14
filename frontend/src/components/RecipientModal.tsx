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
  const [type, setType] = useState('PENERIMA');
  const [picName, setPicName] = useState('');
  const [phone, setPhone] = useState('');
  const [targetPortions, setTargetPortions] = useState('150');
  const [capacity, setCapacity] = useState('150');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('-7.2910');
  const [longitude, setLongitude] = useState('112.7530');
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
          picName: picName || 'Pengurus',
          phone: phone || '-',
          targetPortions: parseInt(targetPortions, 10) || 150,
          capacity: parseInt(capacity, 10) || 150,
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setName('');
        setAddress('');
        setPicName('');
        setPhone('');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registrasi Penerima Baru</h3>
              <p className="text-xs text-slate-500">Panti Asuhan, Posyandu, atau Sekolah penerima</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Panti / Posyandu</label>
            <input
              type="text"
              required
              placeholder="Misal: Panti Werda & Balita harapan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="PENERIMA">PENERIMA</option>
                <option value="PANTI">PANTI</option>
                <option value="POSYANDU">POSYANDU</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama PIC</label>
              <input
                type="text"
                required
                placeholder="Suster Maria"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Kontak HP</label>
              <input
                type="text"
                placeholder="0857-1122-3344"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Makanan (Box/Hari)</label>
              <input
                type="number"
                required
                min="1"
                value={targetPortions}
                onChange={(e) => {
                  setTargetPortions(e.target.value);
                  setCapacity(e.target.value);
                }}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
            <textarea
              required
              rows={2}
              placeholder="Jl. Raya Ngagel No. 102, Wonokromo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 mt-2"
          >
            <Plus className="h-4 w-4" />
            <span>Simpan Penerima</span>
          </button>
        </form>
      </div>
    </div>
  );
}
