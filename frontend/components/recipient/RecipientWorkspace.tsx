'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  Navigation,
  Bell,
  CheckCircle2,
  Clock,
  Utensils,
  MapPin,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Truck
} from 'lucide-react';
import { Recipient, MatchResultData, getRecipients, findMatches, updateFoodStatus } from '@/lib/api';
import { RecipientModal } from './RecipientModal';
import { DistanceMap } from '../map/DistanceMap';

export const RecipientWorkspace: React.FC = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(5.0);
  
  // Matching Engine State
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [searchingMatch, setSearchingMatch] = useState<boolean>(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<boolean>(false);
  
  // Modal State
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      const data = await getRecipients();
      setRecipients(data);
      if (data.length > 0 && !selectedRecipientId) {
        setSelectedRecipientId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load recipients:', err);
    }
  };

  const handleFindMatch = async () => {
    if (!selectedRecipientId) {
      alert('Silakan pilih atau tambahkan Penerima terlebih dahulu!');
      return;
    }

    setSearchingMatch(true);
    setMatchError(null);
    setClaimed(false);
    try {
      const result = await findMatches(selectedRecipientId, maxRadiusKm);
      setMatchResult(result);
    } catch (err: any) {
      setMatchError(err.message || 'Gagal mencari makanan terdekat.');
    } finally {
      setSearchingMatch(false);
    }
  };

  const handleClaimFood = async () => {
    if (!matchResult?.foodId) return;
    try {
      await updateFoodStatus(matchResult.foodId, 'MATCHED');
      setClaimed(true);
    } catch (err: any) {
      alert(err.message || 'Gagal mengklaim makanan.');
    }
  };

  const activeRecipient = recipients.find((r) => r.id === selectedRecipientId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Recipient Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-700 p-6 text-white shadow-xl shadow-sky-900/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              Workspace Penerima (Panti / Posyandu)
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Klaim Makanan & Pantau Jarak Dapur</h2>
          <p className="mt-1 text-xs sm:text-sm text-sky-100">
            Dapatkan notifikasi makanan bergizi terdekat yang siap disalurkan dan lihat rute jarak Haversine secara realtime.
          </p>
        </div>

        {/* Active Recipient Picker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="h-5 w-5 text-sky-200" />
            <select
              value={selectedRecipientId}
              onChange={(e) => {
                setSelectedRecipientId(e.target.value);
                setMatchResult(null);
              }}
              className="bg-transparent font-semibold text-white text-sm focus:outline-none cursor-pointer border-b border-white/40 pb-0.5"
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id} className="text-slate-900">
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsRecipientModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Penerima Baru</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Match Finder & Notification Card */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Match Finder Control Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Pencarian Makanan Terdekat</h3>
                <p className="text-xs text-slate-500">Algoritma Haversine Radius Matching</p>
              </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Radius Toleransi Maksimum</span>
                <span className="text-blue-600 font-bold">{maxRadiusKm} KM</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 KM</span>
                <span>5 KM (Default)</span>
                <span>15 KM</span>
              </div>
            </div>

            <button
              onClick={handleFindMatch}
              disabled={searchingMatch || !selectedRecipientId}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-sky-600/20 hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 transition-all"
            >
              {searchingMatch ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menghitung Jarak Haversine...</span>
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  <span>Cari Makanan Tersedia</span>
                </>
              )}
            </button>
          </div>

          {/* Food Arriving Notification Card */}
          {matchError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 text-rose-700 text-xs flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Informasi Match</p>
                <p>{matchError}</p>
              </div>
            </div>
          )}

          {matchResult && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-md relative overflow-hidden animate-in fade-in duration-300">
              
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Matching Found
              </div>

              {matchResult.matchFound ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-600">Notifikasi Makanan Datang!</span>
                      <h4 className="font-bold text-slate-900 text-base">{matchResult.menuName || 'Nasi Masakan Bergizi'}</h4>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-b border-slate-100 py-3 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pengirim (Dapur):</span>
                      <span className="font-bold text-slate-800">{matchResult.kitchenName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Jumlah Porsi:</span>
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{matchResult.portionCount || 100} Porsi</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Jarak Ke Lokasi:</span>
                      <span className="font-bold text-slate-900">{matchResult.distanceKm?.toFixed(2)} KM</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimasi Waktu Kirim:</span>
                      <span className="font-bold text-slate-900">~{matchResult.estimatedTravelTimeMinutes} Menit</span>
                    </div>
                  </div>

                  {!claimed ? (
                    <button
                      onClick={handleClaimFood}
                      className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Klaim & Terima Makanan Ini</span>
                    </button>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center justify-center space-x-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Makanan Berhasil Diklaim! Status updated to MATCHED.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 text-xs">
                  <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2 opacity-80" />
                  <p className="font-bold text-slate-800 text-sm mb-1">Tidak Ada Makanan Dalam Radius {maxRadiusKm} KM</p>
                  <p>Tidak ditemukan makanan `AVAILABLE` yang belum kedaluwarsa di dalam jarak radius ini. Coba perbesar radius toleransi.</p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Column: Interactive Distance Map */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-sky-600" />
                  <span>Peta Jarak Dapur MBG ke Penerima</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visualisasi titik lokasi, radius {maxRadiusKm} KM, dan rute Haversine
                </p>
              </div>

              {activeRecipient && (
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {activeRecipient.name}
                </span>
              )}
            </div>

            {/* Interactive Leaflet Map */}
            {activeRecipient ? (
              <DistanceMap
                recipientLat={activeRecipient.latitude}
                recipientLng={activeRecipient.longitude}
                recipientName={activeRecipient.name}
                kitchenLat={matchResult?.kitchenLatitude}
                kitchenLng={matchResult?.kitchenLongitude}
                kitchenName={matchResult?.kitchenName}
                radiusKm={maxRadiusKm}
                distanceKm={matchResult?.distanceKm}
                travelTimeMinutes={matchResult?.estimatedTravelTimeMinutes}
              />
            ) : (
              <div className="h-[360px] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                Silakan pilih atau buat data Penerima terlebih dahulu.
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Recipient Registration Modal */}
      <RecipientModal
        isOpen={isRecipientModalOpen}
        onClose={() => setIsRecipientModalOpen(false)}
        onSuccess={(newR) => {
          fetchRecipients();
          setSelectedRecipientId(newR.id);
        }}
      />

    </div>
  );
};
