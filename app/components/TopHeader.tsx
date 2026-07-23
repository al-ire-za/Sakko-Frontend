"use client";

import React from "react";
import { Flame, Sun, Moon, LogOut, Menu } from "lucide-react";

interface TopHeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  onLogout: () => void;
}

export default function TopHeader({
  isDarkMode,
  setIsDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout,
}: TopHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md px-0 lg:px-8 py-3.5 transition-colors ${
        isDarkMode
          ? "bg-slate-900/80 border-slate-800"
          : "bg-white/80 border-slate-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between gap-4" dir="rtl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl border dark:border-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* روزشمار کنکور */}
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-2xl border border-emerald-500/20 dark:text-emerald-600 dark:bg-slate-800/90"> 
            <span className="text-xs font-bold ">
                <span className="text-blue-500">158 : تا کنکور سراسری</span>
            </span>
          </div>

          {/* دانش‌آموزان آنلاین */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 border border-emerald-500/20 px-3 py-1.5 rounded-2xl text-emerald-600 dark:text-emerald-400 dark:bg-slate-800/90 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" ></span>
            <span className="text-blue-500">134 : دانش‌آموز آنلاین</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 px-3 py-2 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}