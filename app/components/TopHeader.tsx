"use client";

import React from "react";
import { Flame, Sun, Moon, LogOut, Menu } from "lucide-react";

interface TopHeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  onLogout: () => void;
  activeTab?: "dashboard" | "planning";
}

export default function TopHeader({
  isDarkMode,
  setIsDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout,
  activeTab = "dashboard"
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
          {activeTab !== "planning" && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl border lg:hidden ..." // فقط توی موبایلِ داشبورد نشون داده میشه
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <img src="S.png" alt="" className="w-12 h-full" />
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