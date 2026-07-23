"use client";

import React, { useState } from "react";
import AuthForm from "./components/AuthForm";
import TopHeader from "./components/TopHeader";
import Sidebar from "./components/Sidebar";
import MainGrid from "./components/MainGrid";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLoginSuccess = (data: any) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // ۱. اگر لاگین نکرده، فقط کامپوننت ورود/ثبت‌نام
  if (!isLoggedIn) {
    return (
      <AuthForm
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // ۲. اگر لاگین کرده، داشبورد اصلی
  return (
    <div
      className={`${isDarkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} min-h-screen transition-colors duration-300 font-sans`}
    >
      <TopHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto flex gap-6 p-4 lg:p-8 items-start">
        <MainGrid isDarkMode={isDarkMode} searchQuery={searchQuery} />

        <Sidebar
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userData={userData}
        />
      </div>
    </div>
  );
}