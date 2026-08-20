"use client";

import React, { useState, useEffect } from "react";
import { Flame } from "lucide-react";

interface ExamCountdownProps {
  isDarkMode: boolean;
  currentDate?: Date;
  examDate?: Date;
}

const DEFAULT_EXAM_DATE = new Date("2027-04-30T08:00:00");

export default function ExamCountdown({
  isDarkMode,
  examDate = DEFAULT_EXAM_DATE,
}: ExamCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = examDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [examDate]);

  return (
    <div
      className={`p-5 rounded-3xl border shadow-lg transition-all ${
        isDarkMode
          ? "bg-slate-900/90 border-slate-800 text-white shadow-indigo-950/20"
          : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-500 shadow-indigo-500/10"
      }`}
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* عنوان و آیکون */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              زمان باقی‌مانده تا کنکور سراسری
            </h3>
            <p className="text-xs text-indigo-100/80 dark:text-slate-400 mt-0.5">
              هر ثانیه فرصتی برای نزدیک‌تر شدن به هدفته!
            </p>
          </div>
        </div>

        {/* بخش تایمر (روز -> ساعت -> دقیقه -> ثانیه) */}
        <div className="flex items-center gap-2 sm:gap-3 text-center" dir="ltr">
          {/* ۱. روز */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center font-extrabold text-lg sm:text-xl border border-white/10 text-amber-300">
              {timeLeft.days}
            </div>
            <span className="text-[10px] text-indigo-100 dark:text-slate-400 mt-1 font-medium">
              روز
            </span>
          </div>

          <span className="text-lg font-bold opacity-60 mb-4">:</span>

          {/* ۲. ساعت */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center font-extrabold text-lg sm:text-xl border border-white/10">
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-indigo-100 dark:text-slate-400 mt-1 font-medium">
              ساعت
            </span>
          </div>

          <span className="text-lg font-bold opacity-60 mb-4">:</span>

          {/* ۳. دقیقه */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center font-extrabold text-lg sm:text-xl border border-white/10">
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-indigo-100 dark:text-slate-400 mt-1 font-medium">
              دقیقه
            </span>
          </div>

          <span className="text-lg font-bold opacity-60 mb-4">:</span>

          {/* ۴. ثانیه */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center font-extrabold text-lg sm:text-xl border border-white/10">
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <span className="text-[10px] text-indigo-100 dark:text-slate-400 mt-1 font-medium">
              ثانیه
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}