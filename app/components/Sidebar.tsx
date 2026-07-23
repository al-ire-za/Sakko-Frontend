"use client";

import React from "react";
import { Search, Users, X } from "lucide-react";

interface SidebarProps {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  userData: any;
}

export default function Sidebar({
  isDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  userData,
}: SidebarProps) {
  return (
    <aside dir="rtl"
      className={`fixed inset-y-0 left-0 z-50 w-80 transition-transform duration-300 transform lg:static lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${
        isDarkMode
          ? "bg-slate-900 border-r border-slate-800 lg:border-none lg:bg-transparent"
          : "bg-white border-r border-slate-200 lg:border-none lg:bg-transparent"
      }`}
    >
      <div className="flex lg:hidden justify-between items-center mb-6">
        <span className="font-bold text-sm">منوی کاربری</span>
        <button onClick={() => setIsSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* ۱. کادر جستجو */}
        <div
          className={`p-3 rounded-2xl border flex items-center gap-2 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          
          <input
            dir="rtl"
            type="text"
            placeholder="جستجو در بخش‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs outline-none text-black dark:text-white text-right placeholder:text-right"
          />
          <Search className="w-4 h-4 text-slate-400" />
        </div>

        {/* ۲. کارت پروفایل */}
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3 border-b pb-3 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
              {userData?.fullName ? userData.fullName[0] : "د"}
            </div>
            <div>
              <h4 className="font-bold text-sm ">
                {userData?.fullName || "دانش‌آموز کنکوری"}
              </h4>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                رشته {userData?.field || "تجربی"}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between p-2">
              <span>سن:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {userData?.age || "۱۷"} سال
              </span>
            </div>
            <div className="flex justify-between p-2">
              <span>ایمیل / تماس:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {userData?.email || "—"}
              </span>
            </div>
            <div className="flex justify-between p-2">
              <span>شماره والدین:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {userData?.parentPhone || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* ۳. بخش دوستان */}
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isDarkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
            <span className="font-bold text-xs flex items-center gap-1.5 p-2">
              <Users className="w-4 h-4 text-indigo-500" />
              دوستان هم‌مسیر (۳)
            </span>
            <button className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              + افزودن
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              { name: "سارینا رضایی", status: "در حال مطالعه ریاضی", online: true },
              { name: "محمدحسین کریمی", status: "۱۵ دقیقه پیش", online: false },
              { name: "آرمینا احمدی", status: "در حال ثبت تست", online: true },
            ].map((friend, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {friend.name[0]}
                    </div>
                    {friend.online && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full absolute bottom-0 right-0 border border-white dark:border-slate-900"></span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {friend.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{friend.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}