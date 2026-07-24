"use client";

import React, { useState } from "react";
import AuthForm from "./components/AuthForm";
import TopHeader from "./components/TopHeader";
import Sidebar from "./components/Sidebar";
import MainGrid from "./components/MainGrid";
import Planning from "./components/Planning";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // استیت مدیریت تب فعال (dashboard یا planning)
  const [activeTab, setActiveTab] = useState<"dashboard" | "planning">("dashboard");

  const handleLoginSuccess = (data: any) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("dashboard");
  };

  // ۱. اگر لاگین نکرده، فرم ورود
  if (!isLoggedIn) {
    return (
      <AuthForm
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // ۲. اگر لاگین کرده
  return (
    <div
      className={`${
        isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      } min-h-screen transition-colors duration-300 font-sans`}
    >
      <TopHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        activeTab={activeTab}
      />

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {activeTab === "planning" ? (
          /* حالت اول: صفحه برنامه‌ریزی (بدون سایدبار و به صورت تمام‌عرض) */
          <div className="w-full space-y-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition mb-2"
              dir="rtl"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به داشبورد</span>
            </button>

            {/* کامپوننت دفترچه برنامه‌ریزی */}
            <Planning isDarkMode={isDarkMode} />
          </div>
        ) : (
          /* حالت دوم: داشبورد اصلی (همراه با سایدبار) */
          <div className="flex gap-6 items-start">
            <div
              className="flex-1 space-y-4"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const card = target.closest("[data-id='planning']");
                if (card) {
                  setActiveTab("planning");
                }
              }}
            >
              <MainGrid isDarkMode={isDarkMode} searchQuery={searchQuery} />
            </div>

            <Sidebar
              isDarkMode={isDarkMode}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userData={userData}
            />
          </div>
        )}
      </div>
    </div>
  );
}