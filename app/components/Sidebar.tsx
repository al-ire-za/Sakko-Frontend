"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Users, X, Loader2, UserPlus, UserCheck } from "lucide-react";
import { API_BASE_URL, getAuthHeaders, fixFileUrl } from "../utils/api";

interface SidebarProps {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  userData?: any;
  onSelectTab?: (tab: string) => void;
}

interface Friend {
  id: number;
  username: string;
  full_name: string;
  last_status: string;
}

export default function Sidebar({
  isDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  searchQuery,
  setSearchQuery,
  userData,
  onSelectTab,
}: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);

  const fetchFriends = useCallback(async () => {
    try {
      setIsLoadingFriends(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/friends/`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setFriends(Array.isArray(data) ? data : data.results || data.friends || []);
      }
    } catch (err) {
      console.error("خطا در لود دوستان:", err);
    } finally {
      setIsLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/friends/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ username: usernameInput.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        const newFriend = data.friend || data;
        setFriends((prev) => [...prev, newFriend]);
        setUsernameInput("");
        setIsModalOpen(false);
      } else {
        if (data.username) {
          setErrorMsg(Array.isArray(data.username) ? data.username[0] : data.username);
        } else if (data.detail) {
          setErrorMsg(data.detail);
        } else {
          setErrorMsg("کاربری با این مشخصات پیدا نشد.");
        }
      }
    } catch (err) {
      setErrorMsg("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    userData?.fullName ||
    userData?.full_name ||
    `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() ||
    userData?.username ||
    "کاربر سکو";

  const isConsultant = userData?.role === "consultant" || userData?.is_consultant;

  return (
    <>
      {/* بک‌دراپ تیره برای موبایل هنگام باز بودن سایدبار */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        dir="rtl"
        className={`fixed inset-y-0 left-0 z-50 w-80 p-4 lg:p-0 transition-transform duration-300 transform lg:sticky lg:top-24 lg:z-10 lg:self-start lg:translate-x-0 max-h-[calc(100vh-7rem)] overflow-y-auto ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } ${
          isDarkMode
            ? "bg-slate-900 border-r border-slate-800 lg:border-none lg:bg-transparent"
            : "bg-white border-r border-slate-200 lg:border-none lg:bg-transparent"
        }`}
      >
        <div className="flex lg:hidden justify-between items-center mb-6 p-3 border-b dark:border-slate-800">
          <span className="font-bold text-sm">منوی کاربری و دوستان</span>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>


        <div className="space-y-6">
          {/* ۱. کادر جستجو در بخش‌ها */}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs outline-none text-slate-800 dark:text-slate-100 text-right"
            />
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          {/* ۲. کارت پروفایل کاربر */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20 shrink-0 overflow-hidden">
                  {userData?.avatar ? (
                    <img
                      src={fixFileUrl(userData.avatar)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{displayName ? displayName[0] : "ک"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate">{displayName}</h4>
                  <span className="text-[11px] text-indigo-500 font-semibold block">
                    {isConsultant
                      ? "مشاور تحصیلی"
                      : `رشته ${userData?.field || "مشخص‌نشده"}`}
                  </span>
                </div>
              </div>

              {onSelectTab && (
                <button
                  onClick={() => onSelectTab("profile")}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition cursor-pointer"
                >
                  ویرایش
                </button>
              )}
            </div>


            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between py-1">
                <span>نام کاربری:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {userData?.username || "—"}
                </span>
              </div>

              {!isConsultant ? (
                <>
                  <div className="flex justify-between py-1">
                    <span>سن:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {userData?.age || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>شماره والدین:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {userData?.parentPhone || userData?.parent_phone || "—"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1">
                    <span>شماره تماس:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {userData?.phone || "—"}
                    </span>
                  </div>
                  {userData?.bio && (
                    <div className="pt-1">
                      <span className="block text-[11px] text-slate-400 mb-1">رزومه:</span>
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {userData.bio}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
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
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                دوستان هم‌مسیر ({friends.length})
              </span>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[11px] text-indigo-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>افزودن</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {isLoadingFriends ? (
                <div className="flex items-center justify-center py-4 text-slate-400 text-xs gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال دریافت...</span>
                </div>
              ) : friends.length === 0 ? (
                <p className="text-[11px] text-center text-slate-400 py-3">
                  هنوز دوستی اضافه نکرده‌اید. با دکمه افزودن دوستان خود را پیدا کنید.
                </p>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-[10px]">
                          {friend.full_name
                            ? friend.full_name[0]
                            : friend.username
                            ? friend.username[0]
                            : "?"}
                        </div>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full absolute bottom-0 right-0 border border-white dark:border-slate-900"></span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {friend.full_name || friend.username}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {friend.last_status || "آنلاین"}
                        </p>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div
            className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl border ${
              isDarkMode
                ? "bg-slate-900 border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-slate-800 border-slate-200">
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-500" />
                <span>افزودن دوست هم‌مسیر</span>
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMsg("");
                }}
                className="text-slate-400 hover:text-slate-200 p-1"
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
                  className={`w-full text-xs px-3 py-2.5 rounded-xl border outline-none transition-colors text-right ${
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
                    setErrorMsg("");
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال افزودن...</span>
                    </>
                  ) : (
                    <span>افزودن دوست</span>
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