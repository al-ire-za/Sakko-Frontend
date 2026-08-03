"use client";

import React, { useState } from "react";
import {
  Calculator,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Percent,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface PercentageCalculatorProps {
  isDarkMode?: boolean;
}

export default function PercentageCalculator({
  isDarkMode = true,
}: PercentageCalculatorProps) {
  const [correct, setCorrect] = useState<string>("");
  const [wrong, setWrong] = useState<string>("");
  const [unanswered, setUnanswered] = useState<string>("");

  // تبدیل ورودی‌ها به عدد
  const correctNum = Math.max(0, parseInt(correct) || 0);
  const wrongNum = Math.max(0, parseInt(wrong) || 0);
  const unansweredNum = Math.max(0, parseInt(unanswered) || 0);

  // مجموع کل سوالات
  const totalQuestions = correctNum + wrongNum + unansweredNum;

  // محاسبه درصد واقعی (با نمره منفی)
  const calculatePercentage = () => {
    if (totalQuestions === 0) return 0;
    const score = (correctNum * 3 - wrongNum) / (totalQuestions * 3);
    return parseFloat((score * 100).toFixed(2));
  };

  // محاسبه درصد بدون نمره منفی (اگر اشتباهات نزده رها می‌شدند)
  const calculatePotentialPercentage = () => {
    if (totalQuestions === 0) return 0;
    const score = (correctNum * 3) / (totalQuestions * 3);
    return parseFloat((score * 100).toFixed(2));
  };

  const actualPercentage = calculatePercentage();
  const potentialPercentage = calculatePotentialPercentage();
  const lostPercentage = parseFloat((potentialPercentage - actualPercentage).toFixed(2));

  // ریست کردن فرم
  const handleReset = () => {
    setCorrect("");
    setWrong("");
    setUnanswered("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* هدر بخش درصدگیری */}
      <div
        className={`flex items-center justify-between p-5 rounded-2xl border transition-colors duration-200 ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-800 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-500">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black">محاسبه درصد آزمون</h1>
            <p
              className={`text-xs mt-0.5 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              تحلیل دقیق نمره منفی و تاثیر پاسخ‌های اشتباه
            </p>
          </div>
        </div>

        {totalQuestions > 0 && (
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            پاک‌سازی
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ورودی سوالات ( سمت راست/بالا ) */}
        <div
          className={`lg:col-span-6 p-6 rounded-2xl border transition-colors duration-200 space-y-5 ${
            isDarkMode
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <h2 className="text-sm font-bold flex items-center gap-2">
            <span>تعداد سوالات را وارد کنید</span>
          </h2>

          {/* پاسخ درست */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              سوالات صحیح
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition outline-none ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 text-emerald-400 focus:border-emerald-500"
                  : "bg-slate-50 border-slate-200 text-emerald-600 focus:border-emerald-500"
              }`}
            />
          </div>

          {/* پاسخ نادرست */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              سوالات نادرست (نمره منفی)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={wrong}
              onChange={(e) => setWrong(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition outline-none ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 text-rose-400 focus:border-rose-500"
                  : "bg-slate-50 border-slate-200 text-rose-600 focus:border-rose-500"
              }`}
            />
          </div>

          {/* سوالات نزده */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              سوالات نزده
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={unanswered}
              onChange={(e) => setUnanswered(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition outline-none ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 text-amber-400 focus:border-amber-500"
                  : "bg-slate-50 border-slate-200 text-amber-600 focus:border-amber-500"
              }`}
            />
          </div>

          {/* خلاصه تعداد کل */}
          <div
            className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium ${
              isDarkMode ? "bg-slate-950 text-slate-400" : "bg-slate-100 text-slate-600"
            }`}
          >
            <span>مجموع کل سوالات:</span>
            <span className="font-bold text-sm text-indigo-500">{totalQuestions} سوال</span>
          </div>
        </div>

        {/* نتیجه درصد و تحلیل شانس ( سمت چپ/پایین ) */}
        <div className="lg:col-span-6 space-y-4">
          {/* اصلی: کارت درصد نهایی */}
          <div
            className={`p-6 rounded-2xl border text-center relative overflow-hidden transition-colors duration-200 ${
              isDarkMode
                ? "bg-slate-900/80 border-slate-800"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
              <Percent className="w-4 h-4 text-cyan-500" />
              درصد نهایی شما
            </span>

            <div className="my-4">
              <span
                className={`text-5xl font-black ${
                  actualPercentage > 50
                    ? "text-emerald-500"
                    : actualPercentage > 20
                    ? "text-indigo-500"
                    : actualPercentage < 0
                    ? "text-rose-500"
                    : isDarkMode
                    ? "text-slate-100"
                    : "text-slate-800"
                }`}
              >
                {actualPercentage}%
              </span>
            </div>

            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
              با احتساب اثر نمره منفی (هر ۳ پاسخ غلط، ۱ پاسخ صحیح را از بین می‌برد)
            </p>
          </div>

          {/* فرعی: تحلیلی (اگر غلط‌ها را نزده می‌گذاشتی) */}
          <div
            className={`p-5 rounded-2xl border transition-colors duration-200 space-y-3 ${
              wrongNum > 0
                ? isDarkMode
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
                  : "bg-amber-50 border-amber-200 text-amber-900"
                : isDarkMode
                ? "bg-slate-900/50 border-slate-800/80 text-slate-400"
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-amber-500">
              <TrendingUp className="w-4 h-4" />
              <span>تحلیل نمره منفی و مدیریت آزمون</span>
            </div>

            {wrongNum > 0 ? (
              <div className="space-y-2 text-xs leading-relaxed">
                <p>
                  اگر به جای پاسخ به{" "}
                  <strong className="text-rose-500 font-bold">{wrongNum}</strong> سوال اشتباه،
                  آن‌ها را <strong className="text-amber-500 font-bold">نزده</strong> رها می‌کردی:
                </p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 font-bold text-sm">
                  <span>درصد جدید شما:</span>
                  <span className="text-emerald-500 text-base">{potentialPercentage}%</span>
                </div>
                <p className="text-[13px] opacity-80 flex items-center gap-1 text-rose-500">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  شما به خاطر پاسخ اشتباه، {lostPercentage}% درصد از دست داده‌اید!
                </p>
              </div>
            ) : (
              <p className="text-xs leading-relaxed">
                هنوز سوال اشتباهی وارد نکرده‌اید. با وارد کردن سوالات غلط می‌توانید میزان خسارت
                نمره منفی را مشاهده کنید.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}