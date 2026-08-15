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
  Package,
  Send,
  Flame,
  Search,
  Check,
} from 'lucide-react';

import OcrModal from '../components/OcrModal';
import KitchenModal from '../components/KitchenModal';
import RecipientModal from '../components/RecipientModal';

// Dynamically import MapComponent to prevent SSR Leaflet window error
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 space-y-2">
      <MapPin className="h-8 w-8 animate-bounce text-blue-600" />
      <span className="text-xs font-semibold">Memuat Peta Interaktif...</span>
    </div>
  ),
});

const NUTRITION_TAG_OPTIONS = [
  'Tinggi Protein',
  'Serat & Vitamin C',
  'Protein Hewani',
  'Omega 3',
  'Sayur Segar',
  'Halal Certified',
];

export default function Home() {
  const [activeRole, setActiveRole] = useState<'DAPUR' | 'RECIPIENT'>('DAPUR');
  const [receiverTab, setReceiverTab] = useState<'CLAIMABLE' | 'HISTORY'>('CLAIMABLE');
  
  // Data States
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [activeKitchenId, setActiveKitchenId] = useState<string>('');
  const [activeRecipientId, setActiveRecipientId] = useState<string>('');
  
  // Form & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [menuName, setMenuName] = useState<string>('');
  const [portionCount, setPortionCount] = useState<number>(100);
  const [cookedAt, setCookedAt] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Tinggi Protein', 'Sayur Segar']);
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

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
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
          tags: selectedTags,
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

  const updateFoodStatus = async (foodId: string, status: string, recipientId?: string) => {
    try {
      const res = await fetch(`/api/foods/${foodId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, recipientId }),
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
    if (!activeRecipientId) return alert('Silakan pilih Penerima!');
    await updateFoodStatus(foodId, 'MATCHED', activeRecipientId);
    alert('Makanan berhasil diklaim! Status berubah menjadi MATCHED.');
    fetchFoods();
  };

  const activeKitchen = kitchens.find((k) => k.id === activeKitchenId) || kitchens[0];
  const activeRecipient = recipients.find((r) => r.id === activeRecipientId) || recipients[0];

  // Calculated Stats
  const activeKitchenFoods = foods.filter((f) => !activeKitchenId || f.kitchenId === activeKitchenId);
  const availablePortionsTotal = activeKitchenFoods
    .filter((f) => f.status === 'AVAILABLE')
    .reduce((sum, f) => sum + (f.portionCount || 0), 0);
  const distributedPortionsTotal = activeKitchenFoods
    .filter((f) => f.status === 'DISTRIBUTED' || f.status === 'MATCHED')
    .reduce((sum, f) => sum + (f.portionCount || 0), 0);
  const availableBatchesCount = activeKitchenFoods.filter((f) => f.status === 'AVAILABLE').length;
  const totalBatchesToday = activeKitchenFoods.length;

  // Filtered Foods for Dapur List
  const filteredFoods = foods.filter((f) => {
    if (activeKitchenId && f.kitchenId !== activeKitchenId) return false;
    if (searchQuery && !f.menuName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus === 'ALL') return true;
    return f.status === filterStatus;
  });

  // Filtered Foods for Recipient (Claimable vs History)
  const claimableFoods = foods.filter((f) => {
    if (f.status !== 'AVAILABLE') return false;
    if (!f.safeUntil) return true;
    return new Date(f.safeUntil).getTime() > now;
  });
  const claimedFoodsHistory = foods.filter(
    (f) => f.status === 'MATCHED' || f.status === 'DISTRIBUTED' || f.recipientId === activeRecipientId
  );

  return (
    <div className="flex-1 flex flex-col bg-[#f4f7fb] min-h-screen text-slate-800">
      
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Core<span className="text-blue-600">MBG</span>
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/70 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <span>Standar Gizi</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Sistem Distribusi Makanan Bergizi & Matching Haversine</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center rounded-full bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveRole('DAPUR')}
              className={`flex items-center space-x-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeRole === 'DAPUR'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Utensils className="h-4 w-4" />
              <span>Dapur MBG (Pengirim)</span>
            </button>

            <button
              onClick={() => setActiveRole('RECIPIENT')}
              className={`flex items-center space-x-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeRole === 'RECIPIENT'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <HeartHandshake className="h-4 w-4" />
              <span>Penerima (Panti/Posyandu)</span>
            </button>
          </div>

          {/* Active Location Indicator Pill */}
          <div className="hidden md:flex items-center space-x-2 rounded-full bg-slate-100 px-3.5 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <span className="truncate max-w-[200px]">
              {activeRole === 'DAPUR'
                ? activeKitchen?.name || 'Dapur MBG Surabaya Pusat'
                : activeRecipient?.name || 'Panti Werda & Balita harapan'}
            </span>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* ======================================================== */}
        {/* DAPUR MBG WORKSPACE                                      */}
        {/* ======================================================== */}
        {activeRole === 'DAPUR' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Dark Blue Hero Banner Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl bg-[#0d2259] p-6 md:p-8 text-white shadow-xl">
              <div className="space-y-2">
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200 border border-blue-400/30 backdrop-blur-md">
                  <Utensils className="h-3.5 w-3.5" />
                  <span>Workspace Dapur MBG (Sender)</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Manajemen Stok & Distribusi Makanan
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                  Catat porsi makanan bergizi siap edar, potret label scan OCR otomatis, dan pantau batas aman konsumsi harian secara realtime.
                </p>
              </div>

              {/* Kitchen Selector Box inside Banner */}
              <div className="flex flex-col space-y-2 bg-[#071333] p-4 rounded-2xl border border-blue-900/60 shadow-inner min-w-[280px]">
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                  LOKASI DAPUR AKTIF
                </span>
                
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={activeKitchenId}
                    onChange={(e) => setActiveKitchenId(e.target.value)}
                    className="bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer border-b border-blue-500/50 pb-1 flex-1 truncate"
                  >
                    {kitchens.map((k) => (
                      <option key={k.id} value={k.id} className="bg-slate-900 text-white">
                        {k.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsKitchenModalOpen(true)}
                    className="flex items-center space-x-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-sm shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Dapur Baru</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-medium pt-1">
                  PIC: <span className="text-slate-200 font-semibold">{activeKitchen?.picName || 'Pak Budi Prasetyo'}</span> • {activeKitchen?.district || 'Genteng'}
                </div>
              </div>
            </div>

            {/* Summary Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat 1 */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Stok Siap Edar</p>
                  <h3 className="text-xl font-black text-slate-900">{availablePortionsTotal} Box</h3>
                  <p className="text-xs font-bold text-blue-600">Dari {availableBatchesCount} batch masak</p>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Send className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Disalurkan Hari Ini</p>
                  <h3 className="text-xl font-black text-slate-900">{distributedPortionsTotal} Box</h3>
                  <p className="text-xs font-bold text-blue-600">Tersalurkan ke Penerima</p>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Kapasitas Dapur</p>
                  <h3 className="text-xl font-black text-slate-900">{activeKitchen?.dailyCapacity || 800} Box/Hari</h3>
                  <p className="text-xs font-bold text-amber-600">Standar Produksi</p>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Total Batch Hari Ini</p>
                  <h3 className="text-xl font-black text-slate-900">{totalBatchesToday} Batch</h3>
                  <p className="text-xs font-medium text-slate-400">Recorded in Dapur</p>
                </div>
              </div>

            </div>

            {/* Dapur Grid Layout (Form Left, Inventory Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Input */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">Input Stok Masakan Baru</h3>
                        <p className="text-xs text-slate-500">Isi porsi & waktu masak atau potret label</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsOcrOpen(true)}
                      className="flex items-center space-x-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5 text-blue-600" />
                      <span>Scan OCR Kamera</span>
                    </button>
                  </div>

                  <form onSubmit={handleCreateFood} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">Nama Menu / Masakan Bergizi</label>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Nasi Ayam Geprek + Sayur Bayam & Buah"
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Jumlah Porsi (Box)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={portionCount}
                          onChange={(e) => setPortionCount(parseInt(e.target.value, 10))}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">Waktu Masak (Cooked At)</label>
                        <input
                          type="datetime-local"
                          required
                          value={cookedAt}
                          onChange={(e) => setCookedAt(e.target.value)}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {ocrNotice && (
                      <p className="text-xs text-emerald-600 font-semibold flex items-center space-x-1.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>{ocrNotice}</span>
                      </p>
                    )}

                    {/* Tag Kandungan Nutrisi Section */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2">Tag Kandungan Nutrisi (Klik untuk memilih)</label>
                      <div className="flex flex-wrap gap-2">
                        {NUTRITION_TAG_OPTIONS.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center space-x-1 ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Standard Kedaluwarsa MBG info card */}
                    <div className="rounded-2xl bg-blue-50/80 border border-blue-200/80 p-3.5 text-xs text-blue-900 space-y-1 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        <strong className="font-bold">Standard Kedaluwarsa MBG:</strong> Porsi makanan akan otomatis bertanda peringatan setelah 4 jam selesai dimasak untuk menjamin keamanan pangan.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Simpan Stok Masakan Dapur</span>
                    </button>
                  </form>

                </div>
              </div>

              {/* Right Column: Inventory List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Daftar Stok Makanan Dapur</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeKitchen ? `Stok aktif di ${activeKitchen.name}` : 'Semua Dapur'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari menu..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 w-36 sm:w-44"
                        />
                      </div>

                      {/* Status Dropdown Filter */}
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white cursor-pointer"
                      >
                        <option value="ALL">Semua Status</option>
                        <option value="AVAILABLE">Tersedia</option>
                        <option value="MATCHED">Matched</option>
                        <option value="DISTRIBUTED">Tersalurkan</option>
                        <option value="EXPIRED">Kedaluwarsa</option>
                      </select>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="space-y-3">
                    {filteredFoods.length === 0 ? (
                      <div className="py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                        <Utensils className="mx-auto h-10 w-10 opacity-30 text-slate-400" />
                        <p className="text-sm font-semibold text-slate-700">Belum ada stok masakan sesuai filter</p>
                        <p className="text-xs text-slate-400">Tambahkan stok baru menggunakan formulir di sebelah kiri.</p>
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

                        let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        if (effectiveStatus === 'MATCHED') badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                        if (effectiveStatus === 'DISTRIBUTED') badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                        if (effectiveStatus === 'EXPIRED') badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';

                        const safeUntilFormatted = f.safeUntil
                          ? new Date(f.safeUntil).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-';

                        return (
                          <div
                            key={f.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-300 transition-all shadow-xs space-y-3 sm:space-y-0"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-extrabold text-slate-900 text-sm">{f.menuName}</h4>
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                  {f.portionCount} Box
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Batas Aman: {safeUntilFormatted}</span>
                                </span>
                                <span className={`font-semibold flex items-center space-x-1 ${isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  <span>Sisa: {remainingText}</span>
                                </span>
                              </div>

                              {f.tags && f.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {f.tags.map((t: string) => (
                                    <span key={t} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                                {effectiveStatus}
                              </span>
                              {f.status === 'MATCHED' && (
                                <button
                                  onClick={() => updateFoodStatus(f.id, 'DISTRIBUTED')}
                                  className="flex items-center space-x-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-xs"
                                >
                                  <PackageCheck className="h-3.5 w-3.5" />
                                  <span>Distribusi</span>
                                </button>
                              )}
                              <button
                                onClick={() => deleteFoodItem(f.id)}
                                className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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

        {/* ======================================================== */}
        {/* RECIPIENT WORKSPACE                                      */}
        {/* ======================================================== */}
        {activeRole === 'RECIPIENT' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Dark Blue Hero Banner Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl bg-[#0d2259] p-6 md:p-8 text-white shadow-xl">
              <div className="space-y-2">
                <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200 border border-blue-400/30 backdrop-blur-md">
                  <HeartHandshake className="h-3.5 w-3.5" />
                  <span>Workspace Penerima (Panti / Posyandu)</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Klaim Makanan & Pantau Jarak Dapur
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                  Dapatkan notifikasi makanan bergizi terdekat yang siap disalurkan dan lihat rute jarak Haversine langsung dari lokasi Anda.
                </p>
              </div>

              {/* Recipient Selector Box inside Banner */}
              <div className="flex flex-col space-y-2 bg-[#071333] p-4 rounded-2xl border border-blue-900/60 shadow-inner min-w-[280px]">
                <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                  PROFIL PENERIMA AKTIF
                </span>
                
                <div className="flex items-center justify-between gap-2">
                  <select
                    value={activeRecipientId}
                    onChange={(e) => {
                      setActiveRecipientId(e.target.value);
                      setMatchResult(null);
                    }}
                    className="bg-transparent font-bold text-white text-sm focus:outline-none cursor-pointer border-b border-blue-500/50 pb-1 flex-1 truncate"
                  >
                    {recipients.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setIsRecipientModalOpen(true)}
                    className="flex items-center space-x-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-sm shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Penerima Baru</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-medium pt-1">
                  PIC: <span className="text-slate-200 font-semibold">{activeRecipient?.picName || 'Suster Maria'}</span> • Target: <span className="text-blue-300 font-bold">{activeRecipient?.targetPortions || 150} Box/Hari</span>
                </div>
              </div>
            </div>

            {/* Recipient Grid (Radius Search Left, Map Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Radius Search */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-5">
                  
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <Navigation className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Pencarian Terdekat</h3>
                      <p className="text-xs text-slate-500">Algoritma Haversine Radius Matching</p>
                    </div>
                  </div>

                  {/* Slider Control Box */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                      <span>Radius Maksimum:</span>
                      <span className="text-blue-700 bg-blue-100 px-3 py-1 rounded-xl font-extrabold text-sm border border-blue-200">
                        {maxRadiusKm.toFixed(1)} KM
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.5"
                      value={maxRadiusKm}
                      onChange={(e) => setMaxRadiusKm(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                      <span>1 KM</span>
                      <span>5 KM (Default)</span>
                      <span>15 KM</span>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Dapur Terjangkau:</span>
                      <span className="font-bold text-slate-900">{claimableFoods.length} Batch Makanan</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Lokasi Anda:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                        {activeRecipient?.address || 'Jl. Raya Ngagel No. 102, Wonokromo'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleFindMatches}
                    disabled={matchingLoading}
                    className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>{matchingLoading ? 'Mencari Makanan...' : 'Cari Makanan Tersedia'}</span>
                  </button>

                </div>
              </div>

              {/* Right Column: Distance Map */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span>Peta Jarak Dapur MBG ke Penerima</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Visualisasi lokasi, radius coverage, dan rute jarak Haversine
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                      {activeRecipient ? activeRecipient.name : '-'}
                    </span>
                  </div>

                  {activeRecipient ? (
                    <MapComponent
                      recipientLat={activeRecipient.latitude}
                      recipientLng={activeRecipient.longitude}
                      recipientName={activeRecipient.name}
                      maxRadiusKm={maxRadiusKm}
                      kitchenLat={matchResult?.matches?.[0] ? matchResult.matches[0].kitchenLat : activeKitchen?.latitude}
                      kitchenLng={matchResult?.matches?.[0] ? matchResult.matches[0].kitchenLng : activeKitchen?.longitude}
                      kitchenName={matchResult?.matches?.[0] ? matchResult.matches[0].kitchenName : activeKitchen?.name}
                      distanceKm={matchResult?.matches?.[0] ? matchResult.matches[0].distanceKm : 4.64}
                      allKitchens={kitchens}
                    />
                  ) : (
                    <div className="w-full h-[380px] rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xs">
                      Silakan pilih Penerima untuk menampilkan peta
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Content Area: Claim Tabs & Food Cards */}
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-6">
              
              {/* Tab Navigation Buttons */}
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <button
                  onClick={() => setReceiverTab('CLAIMABLE')}
                  className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                    receiverTab === 'CLAIMABLE'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Utensils className="h-4 w-4" />
                  <span>Daftar Makanan Siap Klaim ({claimableFoods.length})</span>
                </button>

                <button
                  onClick={() => setReceiverTab('HISTORY')}
                  className={`flex items-center space-x-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                    receiverTab === 'HISTORY'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Riwayat Klaim Penerima ({claimedFoodsHistory.length})</span>
                </button>
              </div>

              {/* TAB 1: CLAIMABLE FOODS */}
              {receiverTab === 'CLAIMABLE' && (
                <div className="space-y-4">
                  {claimableFoods.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                      <Utensils className="mx-auto h-8 w-8 text-slate-400 opacity-50" />
                      <p className="text-sm font-semibold text-slate-700">Belum ada makanan siap diklaim</p>
                      <p className="text-xs text-slate-400">Silakan perbesar radius slider atau tunggu masakan baru disiapkan dapur.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {claimableFoods.map((f) => {
                        const dist = f.distanceKm || 4.64;
                        const kitchenName = f.kitchen?.name || 'DAPUR MBG RUNGKUT INDUSTRI';
                        
                        return (
                          <div
                            key={f.id}
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              {/* Top Badges Row */}
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                                  {kitchenName}
                                </span>
                                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                                  {dist.toFixed(2)} KM
                                </span>
                              </div>

                              {/* Menu Title */}
                              <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                                {f.menuName}
                              </h4>

                              {/* Portion & Timer Row */}
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                                  Tersedia: {f.portionCount} Box
                                </span>
                                <span className="font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                                  <span>00:11:32</span>
                                </span>
                              </div>

                              {/* Nutrition Tags Row */}
                              {f.tags && f.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {f.tags.map((tag: string) => (
                                    <span key={tag} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Full width claim button */}
                            <button
                              onClick={() => claimMatchedFood(f.id)}
                              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
                            >
                              <HeartHandshake className="h-4 w-4" />
                              <span>Klaim Makanan Ini</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CLAIM HISTORY */}
              {receiverTab === 'HISTORY' && (
                <div className="space-y-3">
                  {claimedFoodsHistory.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                      <HeartHandshake className="mx-auto h-8 w-8 text-slate-400 opacity-50" />
                      <p className="text-sm font-semibold text-slate-700">Belum ada riwayat klaim makanan</p>
                    </div>
                  ) : (
                    claimedFoodsHistory.map((h, idx) => {
                      const kitchenName = h.kitchen?.name || 'Dapur MBG Rungkut Industri';
                      const kitchenContact = h.kitchen?.phone || '0857-1122-3344';
                      const kitchenPic = h.kitchen?.picName || 'Ustadz Ahmad Fauzi';
                      const claimedAtText = h.claimedAt
                        ? new Date(h.claimedAt).toLocaleString('id-ID')
                        : '13/8/2026, 13.58.14';

                      return (
                        <div
                          key={h.id || idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-blue-200 transition-all shadow-xs space-y-2 sm:space-y-0"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-extrabold text-slate-900 text-sm">{h.menuName}</h4>
                              <span className="text-xs font-bold text-slate-800">{h.portionCount} Box</span>
                              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                                <Check className="h-3 w-3 text-blue-600" />
                                <span>Disetujui</span>
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">
                              Dari: <strong className="text-slate-800">{kitchenName}</strong> (Jarak: 4.64 KM)
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Diklaim pada: {claimedAtText} • Kontak: {kitchenPic} ({kitchenContact})
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

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
