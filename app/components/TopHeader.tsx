"use client";

import React from "react";
import { Sun, Moon, LogOut, Menu, LayoutDashboard, User } from "lucide-react";

export type TabType = "dashboard" | "planning" | "study-log" | "profile" | "leaderboard" | "percent"| "consulting";

interface TopHeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  onLogout: () => void;
  activeTab?: TabType;
  setActiveTab?: React.Dispatch<React.SetStateAction<TabType>>;
}

export default function TopHeader({
  isDarkMode,
  setIsDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout,
  activeTab = "dashboard",
  setActiveTab
}: TopHeaderProps) {
  // لیست آیتم‌های نوبار (به راحتی می‌توانی بعداً مواردی مثل 'reports' یا 'leaderboard' را اضافه کنی)
  const navItems = [
    { id: "dashboard", label: "صفحه اصلی", icon: LayoutDashboard },
    
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md px-0 lg:px-8 py-3.5 transition-colors ${
        isDarkMode
          ? "bg-slate-900/80 border-slate-800 text-slate-100"
          : "bg-white/80 border-slate-200 text-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between gap-4" dir="rtl">
        {/* بخش راست: لوگو + نوبار */}
        <div className="flex items-center gap-4 justify-around">
          {activeTab !== "planning" && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl border lg:hidden transition ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200"
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* لوگو */}
          <img src="S.png" alt="Logo" className="w-10 h-auto cursor-pointer" />

          {/* نوبار جدید متصل به لوگو */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab(item.id as TabType)}
                  className={`flex items-center  gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                      : isDarkMode
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* بخش چپ: تغییر تم + خروج */}
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