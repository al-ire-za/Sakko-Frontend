"use client";

import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import TopHeader from "./components/TopHeader";
import Sidebar from "./components/Sidebar";
import MainGrid from "./components/MainGrid";
import Planning from "./components/Planning";
import DailyStudy from "./components/DailyStudy"; 
import { ArrowRight } from "lucide-react";


export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    // دریافت پروفایل کاربر
    fetch("http://127.0.0.1:8000/api/accounts/me/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("access_token");
            setIsLoggedIn(false);
          }
          throw new Error("توکن معتبر نیست");
        }
        return res.json();
      })
      .then((data) => {
        setUserData({
          fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.username,
          field: data.field,
          age: data.age,
          email: data.username,
          parentPhone: data.parent_phone,
        });
        setIsLoggedIn(true);
      })
      .catch((err) => {
        console.error("خطای پروفایل:", err);
      });
  }, []);

  // 👈 ۲. اضافه کردن "study-log" به استیت تب‌ها
  const [activeTab, setActiveTab] = useState<"dashboard" | "planning" | "study-log">("dashboard");

  const handleLoginSuccess = (data: any) => {
    setUserData(data);
    setIsLoggedIn(true);
  };

  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refreshToken");
    setUserData(null);
    setIsLoggedIn(false);
    setActiveTab("dashboard");
  };

  if (!isLoggedIn) {
    return (
      <AuthForm
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div
      className={`${
        isDarkMode ? "dark bg-gradient-to-b from bg-slate-950 to-slate-700 text-slate-100" : "bg-gradient-to-t from bg-white/60 to-white text-slate-800"
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
        {/* 🌟 حالت اول: صفحه جدید مطالعه روزانه */}
        {activeTab === "study-log" ? (
          <div className="w-full space-y-4 max-w-3xl mx-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition mb-2 cursor-pointer"
              dir="rtl"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به داشبورد</span>
            </button>

            <DailyStudy isDarkMode={isDarkMode} />
          </div>
        ) : activeTab === "planning" ? (
          /* حالت دوم: صفحه برنامه‌ریزی */
          <div className="w-full space-y-4 max-w-3xl mx-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition mb-2 cursor-pointer"
              dir="rtl"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به داشبورد</span>
            </button>
            <Planning isDarkMode={isDarkMode} />
          </div>
        ) : (
          /* حالت سوم: داشبورد اصلی */
          <div className="flex gap-6 items-start">
            <div
              className="flex-1 space-y-4"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const cardPlanning = target.closest("[data-id='planning']");
                const cardStudyLog = target.closest("[data-id='study-log']"); // 👈 هندل کلیک رو کارت مطالعه روزانه

                if (cardPlanning) {
                  setActiveTab("planning");
                } else if (cardStudyLog) {
                  setActiveTab("study-log");
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