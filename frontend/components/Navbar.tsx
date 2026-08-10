'use client';

import React from 'react';
import { Utensils, HeartHandshake, ShieldCheck, Cpu } from 'lucide-react';

export type UserRole = 'DAPUR' | 'RECIPIENT';

interface NavbarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isBackendConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  isBackendConnected = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20 text-white">
            <Utensils className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Core<span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">MBG</span>
              </h1>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Sistem Distribusi Makanan Bergizi & Matching</p>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex items-center rounded-xl bg-slate-100/90 p-1 text-slate-600 border border-slate-200/60 shadow-inner">
          <button
            onClick={() => setActiveRole('DAPUR')}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeRole === 'DAPUR'
                ? 'bg-white text-blue-600 shadow-sm shadow-blue-900/5 ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Utensils className={`h-4 w-4 ${activeRole === 'DAPUR' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Dapur MBG (Pengirim)</span>
          </button>

          <button
            onClick={() => setActiveRole('RECIPIENT')}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeRole === 'RECIPIENT'
                ? 'bg-white text-blue-600 shadow-sm shadow-blue-900/5 ring-1 ring-black/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <HeartHandshake className={`h-4 w-4 ${activeRole === 'RECIPIENT' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>Penerima (Panti / Posyandu)</span>
          </button>
        </div>

        {/* System Health Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-700 font-semibold">Supabase DB</span>
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
        </div>

      </div>
    </header>
  );
};
