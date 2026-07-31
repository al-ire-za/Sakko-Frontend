"use client";

import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  BookOpen,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Target,
  BarChart3,
  Save,
} from "lucide-react";

export interface StudySession {
  id: number | string;
  subject: string;
  topic: string;
  start_time: string;
  end_time: string;
  test_count: number;
}

interface DailyStudyProps {
  isDarkMode: boolean;
}

const API_BASE_URL = "http://localhost:8000/api";

export default function DailyStudy({ isDarkMode }: DailyStudyProps) {
  // ۱. استیت‌های خواب
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [isSleepSaved, setIsSleepSaved] = useState(false);
  const [isSavingSleep, setIsSavingSleep] = useState(false);

  // ۲. استیت بازه‌های مطالعاتی
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ۳. فرم ثبت بازه جدید
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:30");
  const [newTestCount, setNewTestCount] = useState<number | "">(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // دریافت داده‌های امروز هنگام لود اولیه
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // دریافت اطلاعات خواب
      const sleepRes = await fetch(`${API_BASE_URL}/sleep-logs/`, {
        headers: getAuthHeaders(),
      });
      if (sleepRes.ok) {
        const sleepData = await sleepRes.json();
        if (sleepData.length > 0) {
          setSleepTime(sleepData[0].sleep_time.slice(0, 5));
          setWakeTime(sleepData[0].wake_time.slice(0, 5));
        }
      }

      // دریافت بازه‌های مطالعاتی
      const studyRes = await fetch(`${API_BASE_URL}/study-sessions/`, {
        headers: getAuthHeaders(),
      });
      if (studyRes.ok) {
        const studyData = await studyRes.json();
        setSessions(studyData);
      }
    } catch (err) {
      console.error("خطا در دریافت اطلاعات:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ذخیره الگوی خواب امروز
  const handleSaveSleepLog = async () => {
    setIsSavingSleep(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sleep-logs/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sleep_time: sleepTime,
          wake_time: wakeTime,
        }),
      });

      if (res.ok) {
        setIsSleepSaved(true);;
      }
    } catch (err) {
      console.error("خطا در ذخیره خواب:", err);
    } finally {
      setIsSavingSleep(false);
    }
  };

  // محاسبه دقایق مطالعه
  const calculateMinutes = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;

    if (endTotal < startTotal) {
      endTotal += 24 * 60;
    }

    return Math.max(0, endTotal - startTotal);
  };

  const totalMinutes = sessions.reduce(
    (acc, s) => acc + calculateMinutes(s.start_time, s.end_time),
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalTests = sessions.reduce((acc, s) => acc + Number(s.test_count || 0), 0);

  // افزودن بازه مطالعه جدید
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const payload = {
      subject: newSubject.trim(),
      topic: newTopic.trim() || "عمومی",
      start_time: newStartTime,
      end_time: newEndTime,
      test_count: newTestCount === "" ? 0 : Number(newTestCount),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/study-sessions/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newSession = await res.json();
        setSessions((prev) => [...prev, newSession]);
        setNewSubject("");
        setNewTopic("");
        setNewTestCount(0);
      }
    } catch (err) {
      console.error("خطا در اضافه کردن بازه:", err);
    }
  };

  // حذف بازه
  const handleDeleteSession = async (id: number | string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/study-sessions/${id}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("خطا در حذف بازه:", err);
    }
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">مجموع زمان مطالعه امروز</span>
            <div className="text-xl sm:text-2xl font-extrabold flex items-baseline gap-1">
              <span>{totalHours}</span>
              <span className="text-xs font-normal text-slate-400">ساعت و</span>
              <span>{remainingMinutes}</span>
              <span className="text-xs font-normal text-slate-400">دقیقه</span>
            </div>
          </div>
        </div>

        <div
          className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
            isDarkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">تست‌های امروز</span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-500">
              {totalTests} <span className="text-xs font-normal text-slate-400">تست</span>
            </div>
          </div>
        </div>
      </div>

      {/* تنظیمات خواب */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-500" />
            <span>تنظیمات الگوی خواب امروز</span>
          </h3>
          <button
            onClick={handleSaveSleepLog}
            disabled={isSavingSleep || isSleepSaved}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isSleepSaved
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
            } disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            <span>
              {isSavingSleep
                ? "در حال ذخیره..."
                : isSleepSaved
                ? "ذخیره شد ✓"
                : "ذخیره الگوی خواب"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold">زمان خوابیدن:</span>
            </div>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="bg-transparent text-sm font-bold border-none outline-none text-indigo-600 dark:text-indigo-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold">زمان بیدار شدن:</span>
            </div>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="bg-transparent text-sm font-bold border-none outline-none text-amber-600 dark:text-amber-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* فرم ثبت مطالعه */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <span>ثبت بازه مطالعاتی جدید</span>
        </h3>

        <form onSubmit={handleAddSession} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">نام درس *</label>
              <input
                type="text"
                placeholder="مثلاً: حقوق مدنی، تجارت..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">مبحث مطالعه</label>
              <input
                type="text"
                placeholder="مثلاً: عقود اذنی"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">تعداد تست</label>
              <input
                type="number"
                min="0"
                value={Number.isNaN(newTestCount) ? "" : newTestCount}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewTestCount(val === "" ? "" : Number(val));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">از ساعت</label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">تا ساعت</label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت بازه</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* لیست بازه‌ها */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <h3 className="font-bold text-sm sm:text-base flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>بازه‌های ثبت‌شده امروز</span>
          </div>
          <span className="text-xs text-slate-400 font-normal">{sessions.length} بازه</span>
        </h3>

        {isLoading ? (
          <p className="text-center text-xs text-slate-400 py-8">در حال دریافت داده‌ها...</p>
        ) : sessions.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-8">
            هنوز هیچ بازه مطالعاتی برای امروز ثبت نکرده‌ای!
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const sessionMins = calculateMinutes(session.start_time, session.end_time);
              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold">{session.subject}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">مبحث: {session.topic}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {session.start_time.slice(0, 5)} تا {session.end_time.slice(0, 5)}
                      </span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        ({sessionMins} دقیقه)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      <Target className="w-3.5 h-3.5" />
                      <span>{session.test_count} تست</span>
                    </div>

                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}