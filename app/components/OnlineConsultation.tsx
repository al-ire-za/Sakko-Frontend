"use client";

import React, { useEffect, useState } from "react";

interface Consultant {
  id: number;
  full_name: string;
  short_resume: string;
  average_rating: number;
  active_students_count: number;
  max_capacity: number;
  is_full: boolean;
  img: string | null;
}

interface OnlineConsultationProps {
  isDarkMode: boolean;
}

export default function OnlineConsultation({ isDarkMode }: OnlineConsultationProps) {
  const [hasConsultant, setHasConsultant] = useState<boolean | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchProfileAndConsultants();
  }, []);

  const fetchProfileAndConsultants = async () => {
    try {
      const token = localStorage.getItem("token");

      const profileRes = await fetch(`${API_BASE_URL}/api/accounts/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();

      const currentConsultant = profileData.consultant || profileData.student_profile?.consultant;

      if (currentConsultant) {
        setHasConsultant(true);
      } else {
        setHasConsultant(false);
        const listRes = await fetch(`${API_BASE_URL}/api/accounts/consultants/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listData = await listRes.json();
        
        if (Array.isArray(listData)) {
          setConsultants(listData);
        } else if (Array.isArray(listData.results)) {
          setConsultants(listData.results);
        } else {
          setConsultants([]);
        }
      }
    } catch (err) {
      console.error("خطا در دریافت اطلاعات مشاوران:", err);
      setConsultants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConsultant = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/select-consultant/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ consultant_id: id }),
      });

      if (res.ok) {
        fetchProfileAndConsultants();
      }
    } catch (err) {
      console.error("خطا در انتخاب مشاور:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-xs text-slate-400 dir-rtl">
        در حال دریافت اطلاعات مشاورین...
      </div>
    );
  }

  // 🔴 حالت عدم انتخاب مشاور: چیدمان تک باکسه مرکز صفحه
  if (!hasConsultant) {
    return (
      <div className="w-full max-w-2xl mx-auto py-6 dir-rtl" dir="rtl">
        {/* باکس اصلی شیک و متمرکز */}
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
            isDarkMode
              ? "bg-slate-900/90 border-slate-800/80 shadow-black/40"
              : "bg-white/90 border-slate-200 shadow-slate-200/50"
          }`}
        >
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold dark:text-white text-black">انتخاب مشاور تحصیلی</h2>
            <p className="text-xs text-slate-400 mt-2">
              جهت شروع مشاوره، یکی از مشاوران زیر را انتخاب کنید:
            </p>
          </div>

          {consultants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              هیچ مشاوری در سیستم ثبت نشده است یا مشاور فعال یافت نشد.
            </div>
          ) : (
            
            /* لیست زیر هم (عمودی) */
            <div className="flex flex-col gap-4">
              {consultants.map((c) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isDarkMode
                      ? "bg-slate-950/60 border-slate-800 hover:border-fuchsia-500/40"
                      : "bg-slate-50 border-slate-200 hover:border-fuchsia-500/40"
                  }`}
                >
                  {/* بخش پروفایل و اطلاعات */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* آواتار مشاور */}
                    <div className="w-14 h-14 rounded-2xl dark:bg-slate-800 bg-white border dark:border-slate-700 border-black/20 overflow-hidden flex items-center justify-center shrink-0">
                      {c.img ? (
                        <img src={c.img} alt={c.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                    </div>

                    {/* اطلاعات مشاور: نام + امتیاز + ظرفیت */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                          {c.full_name}
                        </h3>

                        {/* امتیاز ستاره‌ای */}
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                          ⭐ {c.average_rating ? Number(c.average_rating).toFixed(1) : "جدید"}
                        </span>

                        {/* بج ظرفیت و تعداد دانش‌آموزان */}
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium ${
                          c.is_full 
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        }`}>
                            {c.max_capacity || 10} / {c.active_students_count || 0}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1 max-w-sm line-clamp-1">
                        {c.short_resume || "بدون رزومه ثبت‌شده"}
                      </p>
                    </div>
                  </div>

                  {/* دکمه انتخاب (غیرفعال در صورت تکمیل ظرفیت) */}
                  <button
                    disabled={c.is_full}
                    onClick={() => handleSelectConsultant(c.id)}
                    className={`w-full sm:w-auto shrink-0 font-medium text-xs px-6 py-3 rounded-xl transition-all ${
                      c.is_full
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
                        : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-900/20"
                    }`}
                  >
                    {c.is_full ? "تکمیل ظرفیت" : "انتخاب مشاور"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 🟢 حالت چت آنلاین با مشاور
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 dir-rtl">
      <div
        className={`p-6 rounded-3xl border ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200"
        }`}
      >
        <h2 className="text-base font-bold mb-4 text-white">ارتباط آنلاین با مشاور</h2>
        <div className="h-96 rounded-2xl bg-slate-950 p-4 border border-slate-800 flex flex-col items-center justify-center text-slate-400 text-xs">
          محیط چت و تبادل پیام با مشاور
        </div>
      </div>
    </div>
  );
}