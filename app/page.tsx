"use client";

import React, { useState, useEffect, useCallback } from "react";
import AuthForm from "./components/AuthForm";
import TopHeader, { TabType } from "./components/TopHeader";
import Sidebar from "./components/Sidebar";
import MainGrid from "./components/MainGrid";
import Planning from "./components/Planning";
import DailyStudy from "./components/DailyStudy"; 
import Leaderboard from "./components/Leaderboard";
import PercentageCalculator from "./components/PercentageCalculator";
import OnlineConsultation from "./components/OnlineConsultation";
import ConsultantStudentsManager from "./components/ConsultantStudentsManager";
import SendProgramToStudent from "./components/SendProgramToStudent";
import Profile from "./components/Profile";
import { Loader2 } from "lucide-react";
import {
  API_BASE_URL,
  getAuthToken,
  getAuthHeaders,
  clearAuthTokens,
  setSavedUser,
  getSavedUser,
} from "./utils/api";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  const fetchUserProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoggedIn(false);
      setIsInitializing(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/me/`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          clearAuthTokens();
          setIsLoggedIn(false);
        }
        throw new Error("توکن منقضی یا نامعتبر است");
      }

      const data = await res.json();
      setSavedUser(data);

      const rawName = `${data.first_name || ""} ${data.last_name || ""}`.trim();
      const fullName = rawName !== "" ? rawName : data.username;

      setUserData({
        id: data.id,
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        fullName: fullName,
        role: data.role,
        is_consultant: data.role === "consultant",
        field: data.field,
        age: data.age,
        email: data.email || data.username,
        parentPhone: data.parent_phone,
        parent_phone: data.parent_phone,
        bio: data.bio,
        phone: data.phone,
        avatar: data.avatar,
      });

      setIsLoggedIn(true);
    } catch (err) {
      console.error("خطای بارگذاری پروفایل:", err);
      const cached = getSavedUser();
      if (cached && token) {
        setUserData(cached);
        setIsLoggedIn(true);
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleLoginSuccess = (data: any) => {
    if (data.user) {
      setUserData(data.user);
      setSavedUser(data.user);
    }
    setIsLoggedIn(true);
    fetchUserProfile();
  };

  const handleLogout = () => {
    clearAuthTokens();
    setUserData(null);
    setIsLoggedIn(false);
    setActiveTab("dashboard");
  };

  const handleSelectTab = (tabId: string) => {
    const validTabs: Record<string, TabType> = {
      dashboard: "dashboard",
      profile: "profile",
      planning: "planning",
      "study-log": "study-log",
      leaderboard: "leaderboard",
      percentage: "percent",
      percent: "percent",
      consulting: "consulting",
      "students-list": "students-list",
      "send-program": "send-program",
    };

    if (validTabs[tabId]) {
      setActiveTab(validTabs[tabId]);
    } else {
      console.log(`تب ${tabId} انتخاب شد`);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white dir-rtl">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-xs text-slate-400">در حال بارگذاری سکو...</span>
        </div>
      </div>
    );
  }

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
        isDarkMode
          ? "dark bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-800"
      } min-h-screen transition-colors duration-300 font-sans`}
      dir="rtl"
    >
      <TopHeader
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="flex gap-6 items-start">
          {/* محتوای اصلی تب فعال */}
          <div className="flex-1 space-y-4 min-w-0">
            {activeTab === "profile" ? (
              <Profile
                isDarkMode={isDarkMode}
                userData={userData}
                onUserUpdate={fetchUserProfile}
              />
            ) : activeTab === "study-log" ? (
              <DailyStudy isDarkMode={isDarkMode} />
            ) : activeTab === "planning" ? (
              <Planning isDarkMode={isDarkMode} />
            ) : activeTab === "leaderboard" ? (
              <Leaderboard isDarkMode={isDarkMode} />
            ) : activeTab === "percent" ? (
              <PercentageCalculator isDarkMode={isDarkMode} />
            ) : activeTab === "consulting" ? (
              <OnlineConsultation isDarkMode={isDarkMode} />
            ) : activeTab === "students-list" ? (
              <ConsultantStudentsManager isDarkMode={isDarkMode} />
            ) : activeTab === "send-program" ? (
              <SendProgramToStudent isDarkMode={isDarkMode} />
            ) : (
              <MainGrid
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                onSelectTab={handleSelectTab}
              />
            )}
          </div>


          {/* سایدبار: در تب‌های تمام صفحه پنهان می‌شود */}
          {activeTab !== "consulting" && activeTab !== "send-program" && (
            <Sidebar
              isDarkMode={isDarkMode}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              userData={userData}
              onSelectTab={handleSelectTab}
            />
          )}

        </div>
      </div>
    </div>
  );
}