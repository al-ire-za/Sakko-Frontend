"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  startTime: string;
  endTime: string;
  testCount: number;
}

interface DailyStudyProps {
  isDarkMode: boolean;
}

export default function DailyStudy({ isDarkMode }: DailyStudyProps) {
  // ۱. ساعت خواب و بیداری
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");

  // ۲. لیست بازه‌های مطالعاتی
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: "1",
      subject: "زیست‌شناسی",
      topic: "گوارش و جذب مواد",
      startTime: "08:00",
      endTime: "09:30",
      testCount: 25,
    },
  ]);

  // ۳. استیت‌های فرم افزودن بازه جدید
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:30");
  const [newTestCount, setNewTestCount] = useState<number | "">(0); // دیفالت ۰

  // محاسبه اختلاف زمان به دقیقه
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

  // ۴. محاسبات مجموع ساعات و تست‌ها
  const totalMinutes = sessions.reduce(
    (acc, s) => acc + calculateMinutes(s.startTime, s.endTime),
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const totalTests = sessions.reduce((acc, s) => acc + Number(s.testCount || 0), 0);

  // افزودن بازه جدید
  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newEntry: StudySession = {
      id: Date.now().toString(),
      subject: newSubject.trim(),
      topic: newTopic.trim() || "عمومی",
      startTime: newStartTime,
      endTime: newEndTime,
      testCount: newTestCount === "" ? 0 : Number(newTestCount),
    };

    setSessions([...sessions, newEntry]);

    // ریست فرم
    setNewSubject("");
    setNewTopic("");
    setNewTestCount(0);
  };

  // حذف بازه
  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* 📊 بخش اول: کارت‌های خلاصه و مجموع عملکرد روزانه */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* کارت مجموع ساعت مطالعه */}
        <div
          className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Clock className="w-7 h-7" />
          </div>
          <div className="">
            <span className="text-xs text-slate-400 font-medium block mb-1">
              مجموع زمان مطالعه
            </span>
            <div className="text-xl sm:text-2xl font-extrabold flex items-baseline gap-1">
              <span>{totalHours}</span>
              <span className="text-xs font-normal text-slate-400">ساعت و</span>
              <span>{remainingMinutes}</span>
              <span className="text-xs font-normal text-slate-400">دقیقه</span>
            </div>
          </div>
        </div>

        {/* کارت مجموع تعداد تست‌ها */}
        <div
          className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-slate-100"
              : "bg-white border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block mb-1">
              مجموع تست‌های زده‌شده
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-500">
              {totalTests}{" "}
              <span className="text-xs font-normal text-slate-400">تست</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌙 بخش دوم: ثبت ساعت خواب و بیداری */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-indigo-500" />
          <span>تنظیمات الگوی خواب روزانه</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ساعت خوابیدن */}
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

          {/* ساعت بیدار شدن */}
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

      {/* 📝 بخش سوم: فرم افزودن بازه مطالعاتی جدید */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <span>ثبت بازه مطالعاتی جدید</span>
        </h3>

        <form onSubmit={handleAddSession} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* نام درس */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                نام درس *
              </label>
              <input
                type="text"
                placeholder="مثلاً: ریاضی، شیمی..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-right"
              />
            </div>

            {/* مبحث */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                مبحث مطالعه
              </label>
              <input
                type="text"
                placeholder="مثلاً: حد و پیوستگی"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-right"
              />
            </div>

            {/* تعداد تست (دیفالت ۰) */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                تعداد تست
              </label>
              <input
                dir="rtl"
                type="number"
                min="0"
                value={Number.isNaN(newTestCount) ? "" : newTestCount}
                onChange={(e) => {
                    const val = e.target.value;
                    setNewTestCount(val === "" ? "" : Number(val));
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                />
            </div>

            {/* زمان شروع */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                از ساعت
              </label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* زمان پایان */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                تا ساعت
              </label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* دکمه ثبت */}
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت این بازه</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 📚 بخش چهارم: لیست بازه‌های ثبت شده */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDarkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <h3 className="font-bold text-sm sm:text-base flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>بازه‌های ثبت‌شده امروز</span>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            {sessions.length} بازه
          </span>
        </h3>

        {sessions.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-8">
            هنوز هیچ بازه مطالعاتی برای امروز ثبت نکرده‌ای!
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const sessionMins = calculateMinutes(
                session.startTime,
                session.endTime
              );
              return (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 gap-3 hover:border-indigo-500/30 transition"
                >
                  {/* اطلاعات درس و مبحث */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold">
                        {session.subject}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        مبحث: {session.topic}
                      </p>
                    </div>
                  </div>

                  {/* زمان و تعداد تست */}
                  <div className="flex items-center gap-4 text-xs w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {session.startTime} تا {session.endTime}
                      </span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        ({sessionMins} دقیقه)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      <Target className="w-3.5 h-3.5" />
                      <span>{session.testCount} تست</span>
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