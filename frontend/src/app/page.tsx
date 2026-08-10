'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Utensils,
  HeartHandshake,
  Building2,
  Plus,
  Camera,
  Sparkles,
  Layers,
  RefreshCw,
  Clock,
  AlertTriangle,
  PackageCheck,
  Trash2,
  Navigation,
  Bell,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import OcrModal from '../components/OcrModal';
import KitchenModal from '../components/KitchenModal';
import RecipientModal from '../components/RecipientModal';

// Dynamically import MapComponent to prevent SSR Leaflet window error
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 space-y-2">
      <MapPin className="h-8 w-8 animate-bounce text-cyan-500" />
      <span className="text-xs font-semibold">Memuat Peta Interaktif...</span>
    </div>
  ),
});

export default function Home() {
  const [activeRole, setActiveRole] = useState<'DAPUR' | 'RECIPIENT'>('DAPUR');
  
  // Data States
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [activeKitchenId, setActiveKitchenId] = useState<string>('');
  const [activeRecipientId, setActiveRecipientId] = useState<string>('');
  
  // Form & Filter States
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [menuName, setMenuName] = useState<string>('');
  const [portionCount, setPortionCount] = useState<number>(100);
  const [cookedAt, setCookedAt] = useState<string>('');
  const [ocrNotice, setOcrNotice] = useState<string>('');
  
  // Matching & Map States
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(5.0);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [matchingLoading, setMatchingLoading] = useState<boolean>(false);
  
  // Modals
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [now, setNow] = useState<number>(Date.now());

  // Initialize
  useEffect(() => {
    // Default cookedAt to current datetime local string
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setCookedAt(d.toISOString().slice(0, 16));

    fetchKitchens();
    fetchFoods();
    fetchRecipients();

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const fetchKitchens = async () => {
    try {
      const res = await fetch('/api/kitchens');
      const json = await res.json();
      if (json.success && json.data) {
        setKitchens(json.data);
        if (json.data.length > 0 && !activeKitchenId) {
          setActiveKitchenId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching kitchens:', err);
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await fetch('/api/recipients');
      const json = await res.json();
      if (json.success && json.data) {
        setRecipients(json.data);
        if (json.data.length > 0 && !activeRecipientId) {
          setActiveRecipientId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching recipients:', err);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/foods');
      const json = await res.json();
      if (json.success && json.data) {
        setFoods(json.data);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKitchenId) return alert('Silakan pilih Dapur terlebih dahulu!');

    try {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchenId: activeKitchenId,
          menuName,
          portionCount,
          cookedAt: cookedAt ? new Date(cookedAt).toISOString() : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMenuName('');
        setOcrNotice('');
        await fetchFoods();
      } else {
        alert(json.message || 'Gagal menyimpan stok masakan.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const updateFoodStatus = async (foodId: string, status: string) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchFoods();
      }
    } catch (err: any) {
      alert('Error updating status');
    }
  };

  const deleteFoodItem = async (foodId: string) => {
    if (!confirm('Hapus stok makanan ini?')) return;
    try {
      await fetch(`/api/foods/${foodId}`, { method: 'DELETE' });
      await fetchFoods();
    } catch (err) {
      alert('Error deleting food item');
    }
  };

  const handleFindMatches = async () => {
    if (!activeRecipientId) return alert('Silakan pilih Penerima!');
    setMatchingLoading(true);

    try {
      const res = await fetch('/api/matching/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: activeRecipientId,
          maxRadiusKm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMatchResult(json.data);
      } else {
        alert(json.message || 'Gagal mencari matching.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setMatchingLoading(false);
    }
  };

  const claimMatchedFood = async (foodId: string) => {
    await updateFoodStatus(foodId, 'MATCHED');
    alert('Makanan berhasil diklaim! Status berubah menjadi MATCHED.');
    fetchFoods();
  };

  const activeKitchen = kitchens.find((k) => k.id === activeKitchenId);
  const activeRecipient = recipients.find((r) => r.id === activeRecipientId);

  const filteredFoods = foods.filter((f) => {
    if (activeKitchenId && f.kitchenId !== activeKitchenId) return false;
    if (filterStatus === 'ALL') return true;
    return f.status === filterStatus;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/25 text-white">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-slate-100">
                  Core<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MBG</span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">Sistem Distribusi Makanan Bergizi & Matching</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center rounded-2xl bg-slate-900/90 p-1 border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveRole('DAPUR')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                activeRole === 'DAPUR'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Utensils className="h-4 w-4" />
              <span>Dapur MBG (Pengirim)</span>
            </button>

            <button
              onClick={() => setActiveRole('RECIPIENT')}
              className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                activeRole === 'RECIPIENT'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Penerima (Panti / Posyandu)</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* DAPUR MBG WORKSPACE */}
        {activeRole === 'DAPUR' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-slate-900 p-6 md:p-8 border border-blue-500/20 shadow-2xl shadow-blue-950/50">
              <div>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
                  Dapur MBG (Sender Workspace)
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Manajemen Stok & Distribusi Makanan
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Catat porsi makanan bergizi, potret label scan OCR otomatis, dan pantau kedaluwarsa realtime.
                </p>
              </div>

              {/* Kitchen Selector & Add Modal Trigger */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                <div className="flex items-center space-x-2 px-2">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  <select
                    value={activeKitchenId}
                    onChange={(e) => setActiveKitchenId(e.target.value)}
                    className="bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer border-b border-blue-500/40 pb-0.5"
                  >
                    {kitchens.map((k) => (
                      <option key={k.id} value={k.id} className="bg-slate-900 text-slate-100">
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsKitchenModalOpen(true)}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
                >
                  <Plus className="h-4 w-4" />
                  <span>Dapur Baru</span>
                </button>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Form Input */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-6">
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">Input Stok Masakan Baru</h3>
                      <p className="text-xs text-slate-400">Isi porsi & waktu masak atau potret label</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateFood} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Menu / Masakan</label>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Nasi Ayam Geprek + Sayur"
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                        className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Jumlah Porsi (Box)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={portionCount}
                        onChange={(e) => setPortionCount(parseInt(e.target.value, 10))}
                        className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">Waktu Selesai Masak (Cooked At)</label>
                        <button
                          type="button"
                          onClick={() => setIsOcrOpen(true)}
                          className="flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span>Scan OCR Kamera</span>
                        </button>
                      </div>
                      <input
                        type="datetime-local"
                        required
                        value={cookedAt}
                        onChange={(e) => setCookedAt(e.target.value)}
                        className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      {ocrNotice && (
                        <p className="mt-2 text-xs text-emerald-400 font-semibold flex items-center space-x-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>{ocrNotice}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Simpan Stok Masakan</span>
                    </button>
                  </form>

                </div>
              </div>

              {/* Right Column: Inventory List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                        <Layers className="h-5 w-5 text-blue-400" />
                        <span>Daftar Stok Makanan Dapur</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeKitchen ? `Stok di ${activeKitchen.name}` : 'Semua Dapur'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={fetchFoods}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                        title="Refresh Data"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
                        <option value="MATCHED">Matched (Penerima)</option>
                        <option value="DISTRIBUTED">Tersalurkan (DISTRIBUTED)</option>
                        <option value="EXPIRED">Kedaluwarsa (EXPIRED)</option>
                      </select>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3">
                    {filteredFoods.length === 0 ? (
                      <div className="py-16 text-center text-slate-500 border-2 border-dashed border-slate-800/80 rounded-2xl">
                        <Utensils className="mx-auto h-10 w-10 mb-2 opacity-30 text-slate-400" />
                        <p className="text-sm font-medium">Belum ada stok masakan pada filter ini.</p>
                      </div>
                    ) : (
                      filteredFoods.map((f) => {
                        const safeUntilTime = f.safeUntil ? new Date(f.safeUntil).getTime() : 0;
                        const diff = safeUntilTime - now;
                        const isExpired = diff <= 0;
                        let remainingText = '-';
                        if (safeUntilTime) {
                          if (isExpired) {
                            remainingText = 'EXPIRED';
                          } else {
                            const h = Math.floor(diff / (1000 * 60 * 60));
                            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            remainingText = `${h}j ${m}m`;
                          }
                        }

                        const effectiveStatus = isExpired && f.status === 'AVAILABLE' ? 'EXPIRED' : f.status;

                        let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                        if (effectiveStatus === 'MATCHED') badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        if (effectiveStatus === 'DISTRIBUTED') badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                        if (effectiveStatus === 'EXPIRED') badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                        const safeUntilFormatted = f.safeUntil
                          ? new Date(f.safeUntil).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-';

                        return (
                          <div
                            key={f.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:border-blue-500/30 transition-all shadow-md space-y-3 sm:space-y-0"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-bold text-slate-100 text-sm">{f.menuName}</h4>
                                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                                  {f.portionCount} Porsi
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Safe until: {safeUntilFormatted}</span>
                                </span>
                                <span className={`font-semibold flex items-center space-x-1 ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  <span>Sisa: {remainingText}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                                {effectiveStatus}
                              </span>
                              {f.status === 'MATCHED' && (
                                <button
                                  onClick={() => updateFoodStatus(f.id, 'DISTRIBUTED')}
                                  className="flex items-center space-x-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"
                                >
                                  <PackageCheck className="h-3.5 w-3.5" />
                                  <span>Distribusi</span>
                                </button>
                              )}
                              <button
                                onClick={() => deleteFoodItem(f.id)}
                                className="p-2 rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* RECIPIENT WORKSPACE */}
        {activeRole === 'RECIPIENT' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Banner */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl bg-gradient-to-r from-cyan-950/90 via-blue-900/60 to-slate-900 p-6 md:p-8 border border-cyan-500/20 shadow-2xl shadow-cyan-950/50">
              <div>
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/30">
                  Workspace Penerima (Panti / Posyandu)
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Klaim Makanan & Pantau Jarak Dapur
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Dapatkan notifikasi makanan bergizi terdekat yang siap disalurkan dan lihat rute jarak Haversine.
                </p>
              </div>

              {/* Recipient Selector & Add Modal Trigger */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md">
                <div className="flex items-center space-x-2 px-2">
                  <HeartHandshake className="h-5 w-5 text-cyan-400" />
                  <select
                    value={activeRecipientId}
                    onChange={(e) => {
                      setActiveRecipientId(e.target.value);
                      setMatchResult(null);
                    }}
                    className="bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer border-b border-cyan-500/40 pb-0.5"
                  >
                    {recipients.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-slate-100">
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsRecipientModalOpen(true)}
                  className="flex items-center justify-center space-x-1.5 rounded-xl bg-cyan-600 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-600/30"
                >
                  <Plus className="h-4 w-4" />
                  <span>Penerima Baru</span>
                </button>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Match Finder & Notification */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">Pencarian Makanan Terdekat</h3>
                      <p className="text-xs text-slate-400">Algoritma Haversine Radius Matching</p>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Radius Toleransi Maksimum</span>
                      <span className="text-cyan-400 font-bold text-sm">{maxRadiusKm.toFixed(1)} KM</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={maxRadiusKm}
                      onChange={(e) => setMaxRadiusKm(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-slate-800"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                      <span>1 KM</span>
                      <span>5 KM (Default)</span>
                      <span>15 KM</span>
                    </div>
                  </div>

                  <button
                    onClick={handleFindMatches}
                    disabled={matchingLoading}
                    className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
                  >
                    <Bell className="h-4 w-4" />
                    <span>{matchingLoading ? 'Mencari Makanan...' : 'Cari Makanan Tersedia'}</span>
                  </button>
                </div>

                {/* Match Result Notification Card */}
                {matchResult && (
                  <div>
                    {(matchResult.matchFound || (matchResult.matches && matchResult.matches.length > 0)) ? (
                      <div className="space-y-4">
                        {(matchResult.matches || [matchResult]).map((m: any, idx: number) => {
                          const fId = m.foodId || m.id || matchResult.foodId;
                          const mName = m.menuName || matchResult.menuName || 'Nasi Masakan Bergizi';
                          const kName = m.kitchenName || matchResult.kitchenName || 'Dapur MBG';
                          const dist = m.distanceKm || matchResult.distanceKm || 0;
                          const portions = m.portionCount || matchResult.portionCount || 100;
                          const estMinutes = m.estimatedTravelTimeMinutes || Math.round(dist * 3) + 5;

                          return (
                            <div
                              key={fId || idx}
                              className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl relative overflow-hidden space-y-4 animate-in fade-in duration-300"
                            >
                              <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-2xl uppercase tracking-wider">
                                {idx === 0 ? 'Terdekat (Top Match)' : `Opsi #${idx + 1}`}
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/30">
                                  <Truck className="h-6 w-6" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-cyan-400">Notifikasi Makanan Datang!</span>
                                  <h4 className="font-extrabold text-slate-100 text-base">
                                    {mName}
                                  </h4>
                                </div>
                              </div>

                              <div className="space-y-2 border-t border-b border-slate-800 py-3 text-xs text-slate-300">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Pengirim (Dapur):</span>
                                  <span className="font-bold text-slate-100">{kName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Jumlah Porsi:</span>
                                  <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                                    {portions} Porsi
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Jarak Ke Lokasi:</span>
                                  <span className="font-bold text-slate-100">{dist.toFixed(2)} KM</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Estimasi Waktu Kirim:</span>
                                  <span className="font-bold text-slate-100">~{estMinutes} Menit</span>
                                </div>
                              </div>

                              <button
                                onClick={() => claimMatchedFood(fId)}
                                className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Klaim & Terima Makanan Ini</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-xs text-rose-300 space-y-2">
                        <AlertCircle className="mx-auto h-8 w-8 text-amber-400" />
                        <p className="font-bold text-slate-100 text-sm">Tidak Ada Makanan Dalam Radius Ini</p>
                        <p className="text-slate-400">
                          Tidak ditemukan makanan AVAILABLE di radius {maxRadiusKm.toFixed(1)} KM. Coba perbesar jarak radius slider.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Right Column: Distance Map Card */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 shadow-xl backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-cyan-400" />
                        <span>Peta Jarak Dapur MBG ke Penerima</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Visualisasi lokasi, radius coverage, dan rute Haversine
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      {activeRecipient ? activeRecipient.name : '-'}
                    </span>
                  </div>

                  {activeRecipient ? (
                    <MapComponent
                      recipientLat={activeRecipient.latitude}
                      recipientLng={activeRecipient.longitude}
                      recipientName={activeRecipient.name}
                      maxRadiusKm={maxRadiusKm}
                      kitchenLat={matchResult?.matches?.[0] ? matchResult.matches[0].kitchenLat : (matchResult?.kitchenLatitude || activeKitchen?.latitude)}
                      kitchenLng={matchResult?.matches?.[0] ? matchResult.matches[0].kitchenLng : (matchResult?.kitchenLongitude || activeKitchen?.longitude)}
                      kitchenName={matchResult?.matches?.[0] ? matchResult.matches[0].kitchenName : (matchResult?.kitchenName || activeKitchen?.name)}
                      distanceKm={matchResult?.matches?.[0] ? matchResult.matches[0].distanceKm : matchResult?.distanceKm}
                      allKitchens={kitchens}
                    />
                  ) : (
                    <div className="w-full h-[380px] rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                      Silakan pilih Penerima untuk menampilkan peta
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      <OcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onScanSuccess={(cookedAtIso, parsedTimeText) => {
          if (cookedAtIso) {
            const dateObj = new Date(cookedAtIso);
            dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
            setCookedAt(dateObj.toISOString().slice(0, 16));
          }
          setOcrNotice(parsedTimeText);
        }}
      />

      <KitchenModal
        isOpen={isKitchenModalOpen}
        onClose={() => setIsKitchenModalOpen(false)}
        onSuccess={async () => {
          await fetchKitchens();
        }}
      />

      <RecipientModal
        isOpen={isRecipientModalOpen}
        onClose={() => setIsRecipientModalOpen(false)}
        onSuccess={async () => {
          await fetchRecipients();
        }}
      />
    </div>
  );
}
