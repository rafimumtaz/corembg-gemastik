'use client';

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Plus,
  Camera,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  PackageCheck,
  Trash2,
  Building2,
  RefreshCw,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Kitchen, FoodStock, getKitchens, getFoods, createFood, updateFoodStatus, deleteFood } from '@/lib/api';
import { OcrCameraModal } from './OcrCameraModal';
import { KitchenModal } from './KitchenModal';

export const DapurWorkspace: React.FC = () => {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchenId, setSelectedKitchenId] = useState<string>('');
  const [foods, setFoods] = useState<FoodStock[]>([]);
  
  // Form State
  const [menuName, setMenuName] = useState('');
  const [portionCount, setPortionCount] = useState<number>(100);
  const [cookedAt, setCookedAt] = useState<string>(new Date().toISOString().slice(0, 16));
  
  // Modals & UI State
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [ocrTextNotice, setOcrTextNotice] = useState<string | null>(null);

  // Time ticker for live countdown
  const [, setNow] = useState(new Date());

  useEffect(() => {
    fetchKitchens();
    fetchFoods();

    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000); // refresh timer calculation every 10s

    return () => clearInterval(interval);
  }, []);

  const fetchKitchens = async () => {
    try {
      const data = await getKitchens();
      setKitchens(data);
      if (data.length > 0 && !selectedKitchenId) {
        setSelectedKitchenId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load kitchens:', err);
    }
  };

  const fetchFoods = async () => {
    try {
      const data = await getFoods();
      setFoods(data);
    } catch (err) {
      console.error('Failed to load foods:', err);
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKitchenId) {
      alert('Silakan pilih atau tambahkan Dapur terlebih dahulu!');
      return;
    }

    setLoading(true);
    try {
      await createFood({
        kitchenId: selectedKitchenId,
        menuName,
        portionCount: Number(portionCount),
        cookedAt: cookedAt ? new Date(cookedAt).toISOString() : undefined,
      });

      setMenuName('');
      setPortionCount(100);
      setOcrTextNotice(null);
      await fetchFoods();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan stok makanan.');
    } finally {
      setLoading(false);
    }
  };

  const handleOcrSuccess = (parsedIsoDate: string, rawText?: string) => {
    const formatted = new Date(parsedIsoDate).toISOString().slice(0, 16);
    setCookedAt(formatted);
    if (rawText) {
      setOcrTextNotice(`OCR Hasil Deteksi: "${rawText}"`);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'AVAILABLE' | 'MATCHED' | 'EXPIRED' | 'DISTRIBUTED') => {
    try {
      await updateFoodStatus(id, status);
      await fetchFoods();
    } catch (err: any) {
      alert(err.message || 'Gagal mengupdate status.');
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus stok makanan ini?')) return;
    try {
      await deleteFood(id);
      await fetchFoods();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus stok makanan.');
    }
  };

  const filteredFoods = foods.filter((f) => {
    if (selectedKitchenId && f.kitchenId !== selectedKitchenId) return false;
    if (filterStatus === 'ALL') return true;
    return f.status === filterStatus;
  });

  const activeKitchen = kitchens.find((k) => k.id === selectedKitchenId);

  // Helper for live countdown
  const getRemainingTimeText = (safeUntilStr?: string | null) => {
    if (!safeUntilStr) return { text: '-', isExpired: false };
    const safeUntil = new Date(safeUntilStr).getTime();
    const diff = safeUntil - Date.now();
    if (diff <= 0) return { text: 'EXPIRED', isExpired: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${hours}j ${mins}m`, isExpired: false };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Kitchen Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl shadow-blue-900/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              Dapur MBG (Sender Workspace)
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Manajemen Stok & Distribusi Makanan</h2>
          <p className="mt-1 text-xs sm:text-sm text-blue-100">
            Catat porsi makanan bergizi, gunakan scan OCR otomatis label waktu, dan pantau status kedaluwarsa secara realtime.
          </p>
        </div>

        {/* Active Kitchen Picker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-200" />
            <select
              value={selectedKitchenId}
              onChange={(e) => setSelectedKitchenId(e.target.value)}
              className="bg-transparent font-semibold text-white text-sm focus:outline-none cursor-pointer border-b border-white/40 pb-0.5"
            >
              {kitchens.map((k) => (
                <option key={k.id} value={k.id} className="text-slate-900">
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsKitchenModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Dapur Baru</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Input Form, Right = Inventory List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Input Stok Masakan Baru</h3>
                <p className="text-xs text-slate-500">Isi porsi & waktu masak atau potret label</p>
              </div>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-4">
              
              {/* Menu Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Menu / Masakan</label>
                <input
                  type="text"
                  required
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Misal: Nasi Ayam Geprek + Sayur"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Portion Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Porsi (Box)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={portionCount}
                  onChange={(e) => setPortionCount(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Cooked At Datetime + Camera Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Waktu Selesai Masak (Cooked At)</label>
                  <button
                    type="button"
                    onClick={() => setIsOcrOpen(true)}
                    className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Scan OCR Kamera</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    value={cookedAt}
                    onChange={(e) => setCookedAt(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {ocrTextNotice && (
                  <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{ocrTextNotice}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Stok Masakan'}</span>
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Inventory List Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span>Daftar Stok Makanan Dapur</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {activeKitchen ? `Stok di ${activeKitchen.name}` : 'Semua Dapur'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchFoods}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
                  <option value="MATCHED">Matched (Penerima)</option>
                  <option value="DISTRIBUTED">Tersalurkan (DISTRIBUTED)</option>
                  <option value="EXPIRED">Kedaluwarsa (EXPIRED)</option>
                </select>
              </div>
            </div>

            {/* Food Cards Grid */}
            {filteredFoods.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                <Utensils className="mx-auto h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm font-medium">Belum ada stok masakan pada filter ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFoods.map((food) => {
                  const { text: remainingText, isExpired } = getRemainingTimeText(food.safeUntil);
                  const effectiveStatus = isExpired && food.status === 'AVAILABLE' ? 'EXPIRED' : food.status;

                  return (
                    <div
                      key={food.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-sm">{food.menuName}</h4>
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {food.portionCount} Porsi
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Safe until: {food.safeUntil ? new Date(food.safeUntil).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                          </span>

                          <span className={`font-semibold flex items-center space-x-1 ${isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Sisa: {remainingText}</span>
                          </span>
                        </div>
                      </div>

                      {/* Right Action & Badges */}
                      <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                        {/* Status Pill Badge */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            effectiveStatus === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : effectiveStatus === 'MATCHED'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : effectiveStatus === 'DISTRIBUTED'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {effectiveStatus}
                        </span>

                        {/* Quick Mark Distributed */}
                        {food.status === 'MATCHED' && (
                          <button
                            onClick={() => handleStatusUpdate(food.id, 'DISTRIBUTED')}
                            className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                            title="Tandai Sudah Terdistribusi"
                          >
                            <PackageCheck className="h-3.5 w-3.5" />
                            <span>Distribusi</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteFood(food.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Hapus Makanan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Modals */}
      <OcrCameraModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onOcrSuccess={handleOcrSuccess}
      />

      <KitchenModal
        isOpen={isKitchenModalOpen}
        onClose={() => setIsKitchenModalOpen(false)}
        onSuccess={(newK) => {
          fetchKitchens();
          setSelectedKitchenId(newK.id);
        }}
      />

    </div>
  );
};
