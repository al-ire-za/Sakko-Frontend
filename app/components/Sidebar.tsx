"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Users, X, Loader2 } from "lucide-react";

interface SidebarProps {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  userData?: any; // اختیاری شد
}

interface Friend {
  id: number;
  username: string;
  full_name: string;
  last_status: string;
}

interface UserProfile {
  fullName: string;
  username: string;
  field: string;
  age: string | number;
  parentPhone: string;
}

export default function Sidebar({
  isDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  userData: propUserData,
}: SidebarProps) {
  // --- استیت‌های مربوط به اطلاعات کاربر ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // --- استیت‌های مربوط به بخش دوستان ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  // ۱. دریافت اطلاعات پروفایل کاربر و لیست دوستان
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    if (!token) {
      setIsLoadingFriends(false);
      setIsLoadingProfile(false);
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // دریافت اطلاعات کاربر جاری
    fetch("http://127.0.0.1:8000/api/accounts/me/", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت پروفایل");
        return res.json();
      })
      .then((data) => {
        // مپ کردن دقیق فیلدهای دریافتی از Django
        const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.full_name || data.username || "کاربر";
        setProfile({
          fullName: fullName,
          username: data.username || data.email || "—",
          field: data.field || data.study_field || "ثبت نشده",
          age: data.age || "—",
          parentPhone: data.parent_phone || data.parent_mobile || "—",
        });
      })
      .catch((err) => console.error("خطا در لود پروفایل:", err))
      .finally(() => setIsLoadingProfile(false));

    // دریافت لیست دوستان
    fetch("http://127.0.0.1:8000/api/accounts/friends/", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت دوستان");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFriends(data);
        } else if (data.results && Array.isArray(data.results)) {
          setFriends(data.results);
        } else if (data.friends && Array.isArray(data.friends)) {
          setFriends(data.friends);
        }
      })
      .catch((err) => console.error("خطا در لود دوستان:", err))
      .finally(() => setIsLoadingFriends(false));
  }, []);

  // ۲. ارسال درخواست افزودن دوست جدید
  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('access_token');

      const response = await axios.post(
        'http://127.0.0.1:8000/api/accounts/friends/',
        { username: usernameInput },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newFriend = response.data.friend || response.data;
      setFriends((prev) => [...prev, newFriend]);
      setUsernameInput('');
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const errData = err.response.data;

        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          setErrorMsg('نشست شما منقضی شده است. لطفا مجدداً وارد شوید.');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return;
        }

        if (status === 404) {
          setErrorMsg('کاربری با این نام کاربری یافت نشد.');
          return;
        }

        let backendMessage = '';
        if (typeof errData.username === 'string') backendMessage = errData.username;
        else if (Array.isArray(errData.username)) backendMessage = errData.username[0];
        else if (errData.detail) backendMessage = errData.detail;
        else if (errData.non_field_errors) backendMessage = errData.non_field_errors[0];

        if (backendMessage.includes('Given token not valid') || backendMessage.includes('token')) {
          setErrorMsg('نشست شما منقضی شده، لطفاً دوباره لاگین کنید.');
        } else if (backendMessage) {
          setErrorMsg(backendMessage);
        } else {
          setErrorMsg('کاربری با این مشخصات پیدا نشد.');
        }
      } else {
        setErrorMsg('ارتباط با سرور برقرار نشد.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ترجیح دادن profile استیت به propUserData
  const currentUser = profile || propUserData;

  return (
    <>
      <aside
        dir="rtl"
        className={`fixed inset-y-0 left-0 z-50 w-80 transition-transform duration-300 transform lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isDarkMode
            ? "bg-slate-900 border-r border-slate-800 lg:border-none lg:bg-transparent"
            : "bg-white border-r border-slate-200 lg:border-none lg:bg-transparent"
        }`}
      >
        <div className="flex lg:hidden justify-between items-center mb-6 p-3">
          <span className="border dark:border-slate-800 border-slate-200 p-2 rounded-bl-lg text-sm">
            منوی کاربری
          </span>
          <button onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5 border dark:border-slate-800 border-slate-200 rounded-bl-lg p-1" />
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

          {/* ۲. کارت پروفایل پویا */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                در حال دریافت اطلاعات...
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b pb-3 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
                    {currentUser?.fullName ? currentUser.fullName[0] : "ک"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {currentUser?.fullName || "دانش‌آموز"}
                    </h4>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      رشته {currentUser?.field || "مشخص‌نشده"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between p-2">
                    <span>سن:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {currentUser?.age || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span>نام کاربری:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {currentUser?.username || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2">
                    <span>شماره والدین:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {currentUser?.parentPhone || "—"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ۳. بخش دوستان هم‌مسیر */}
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
                دوستان هم‌مسیر ({friends.length})
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                + افزودن
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {isLoadingFriends ? (
                <p className="text-[10px] text-center text-slate-400 py-2">
                  در حال دریافت...
                </p>
              ) : friends.length === 0 ? (
                <p className="text-[10px] text-center text-slate-400 py-2">
                  هنوز دوستی اضافه نکرده‌اید.
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between text-xs p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {friend.full_name ? friend.full_name[0] : (friend.username ? friend.username[0] : "?")}
                        </div>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full absolute bottom-0 right-0 border border-white dark:border-slate-900"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {friend.full_name || friend.username}
                        </p>
                        <p className="text-[10px] text-slate-400">{friend.last_status || "آنلاین"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* مودال افزودن دوست جدید */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" dir="rtl">
          <div
            className={`w-full max-w-sm p-5 rounded-2xl shadow-xl border ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800">
              <h3 className="text-sm font-bold">افزودن دوست هم‌مسیر</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMsg('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  نام کاربری (Username) دوست خود را وارد کنید:
                </label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-xl border outline-none transition-colors ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 text-slate-200 focus:border-indigo-500"
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500"
                  }`}
                />
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-500 font-medium">{errorMsg}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMsg('');
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      در حال بررسی...
                    </>
                  ) : (
                    'افزودن'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}