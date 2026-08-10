'use client';

import React, { useState } from 'react';
import { Navbar, UserRole } from '@/components/Navbar';
import { DapurWorkspace } from '@/components/dapur/DapurWorkspace';
import { RecipientWorkspace } from '@/components/recipient/RecipientWorkspace';
import { Utensils, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeRole, setActiveRole] = useState<UserRole>('DAPUR');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Top Navbar */}
      <Navbar activeRole={activeRole} setActiveRole={setActiveRole} />

      {/* Main Workspace Body */}
      <main className="flex-1">
        {activeRole === 'DAPUR' ? (
          <DapurWorkspace />
        ) : (
          <RecipientWorkspace />
        )}
      </main>

      {/* Minimalist Blue Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-semibold text-slate-700">
            <Utensils className="h-4 w-4 text-blue-600" />
            <span>CoreMBG Gemastik &copy; 2026</span>
          </div>
          <p className="text-slate-400">
            Platform Pencatatan Dapur MBG, OCR Waktu Masak, & Matching Haversine Penerima
          </p>
          <div className="flex items-center space-x-1 text-emerald-600 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Connected to Supabase DB</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
