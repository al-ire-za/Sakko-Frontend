"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, Flame, BookOpen, Clock, Award, Loader2 } from "lucide-react";

interface TopStudent {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  total_hours: number;
  total_tests: number;
}

type PeriodType = "day" | "week" | "month";

// 🌟 اضافه کردن isDarkMode به پراپ‌های کامپوننت
interface LeaderboardProps {
  isDarkMode?: boolean;
}

export default function Leaderboard({ isDarkMode = true }: LeaderboardProps) {
  const [period, setPeriod] = useState<PeriodType>("day");
  const [students, setStudents] = useState<TopStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/api/leaderboard/?period=${period}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // 👈 ارسال توکن با استاندارد Bearer
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("خطا در ارتباط با سرور:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold shadow-md">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
        );
      case 1:
        return (
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold ${
            isDarkMode ? "bg-slate-700/50 text-slate-300 border-slate-600" : "bg-slate-200 text-slate-600 border-slate-300"
          }`}>
            <Medal className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold">
            <Award className="w-4 h-4 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
            isDarkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"
          }`}>
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4" dir="rtl">
      {/* هدر بخش هماهنگ با تم */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-5 rounded-2xl border transition-all duration-200 ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200/80 text-slate-800 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black">نفرات برتر مطالعه</h1>
            <p className={`text-xs mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              رتبه‌بندی بر اساس مجموع ساعت مطالعه و تعداد تست
            </p>
          </div>
        </div>

        {/* دکمه‌های فیلتر زمانی */}
        <div className={`flex p-1 rounded-xl border self-stretch sm:self-auto justify-center ${
          isDarkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
        }`}>
          {(["day", "week", "month"] as PeriodType[]).map((p) => {
            const labels = { day: "امروز", week: "این هفته", month: "این ماه" };
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  period === p
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : isDarkMode
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* جدول لیست نفرات برتر */}
      <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs">در حال دریافت برترین‌ها...</span>
          </div>
        ) : students.length === 0 ? (
          <div className={`p-12 text-center text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            در این بازه زمانی هنوز گزارش مطالعه‌ای ثبت نشده است.
          </div>
        ) : (
          <div className={`divide-y ${isDarkMode ? "divide-slate-800/80" : "divide-slate-100"}`}>
            {students.map((student, index) => (
              <div
                key={student.id}
                className={`flex items-center justify-between p-4 transition ${
                  isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50"
                }`}
              >
                {/* رتبه + مشخصات */}
                <div className="flex items-center gap-3.5">
                  {getRankBadge(index)}
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${
                      isDarkMode ? "text-slate-100" : "text-slate-800"
                    }`}>
                      {student.full_name}
                      
                    </h3>
                    <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                      {student.username}@
                    </span>
                  </div>
                </div>

                {/* ساعت مطالعه و تست */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    isDarkMode ? "bg-slate-800/60 border-slate-700/50 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-800"
                  }`}>
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-black">
                      {student.total_hours} <span className="text-[10px] font-normal text-slate-400">ساعت</span>
                    </span>
                  </div>

                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    isDarkMode ? "bg-slate-800/60 border-slate-700/50 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-800"
                  }`}>
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-black">
                      {student.total_tests} <span className="text-[10px] font-normal text-slate-400">تست</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}