"use client";

import React, { useState } from "react";
import { GraduationCap, Sun, Moon } from "lucide-react";

interface AuthFormProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLoginSuccess: (userData: any) => void;
}

export default function AuthForm({
  isDarkMode,
  setIsDarkMode,
  onLoginSuccess,
}: AuthFormProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    parentPhone: "",
    age: "",
    field: "تجربی",
    password: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(formData);
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDarkMode
          ? "bg-slate-900 text-white"
          : "bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-800"
      }`}
    >
      {/* دکمه سوئیچ تم */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-5 left-5 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-lg backdrop-blur-md transition-all hover:scale-105"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </button>

      <div
        className={`w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-md border transition-all ${
          isDarkMode
            ? "bg-slate-800/90 border-slate-700"
            : "bg-white/90 border-white/20"
        }`}
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="S.png" alt="" className="w-20 h-20" />
          <h1 className="text-2xl font-black tracking-tight">
            {authMode === "login"
              ? "ورود به حساب دانش‌آموز"
              : "ثبت‌نام دانش‌آموز جدید"}
          </h1>
          
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "register" && (
            <>
              <div>
                <label className="text-xs font-bold block mb-1 text-right">
                  : نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="مثال: علی محمدی"
                  className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right placeholder:text-right${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 focus:border-indigo-400"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1 text-right">: سن</label>
                  <input
                    type="number"
                    name="age"
                    required
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="17"
                    className={`w-full p-3 rounded-xl border text-sm outline-none transition ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 focus:border-indigo-400"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-right">
                    : رشته تحصیلی
                  </label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm outline-none transition ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 focus:border-indigo-400"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                    }`}
                  >
                    <option value="تجربی">تجربی</option>
                    <option value="ریاضی">ریاضی</option>
                    <option value="انسانی">انسانی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-right">
                    : شماره همراه والدین
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  required
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  placeholder="0912..."
                  className={`w-full p-3 rounded-xl border text-sm outline-none transition ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 focus:border-indigo-400"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500"
                  }`}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold block mb-1 text-right font-bnaz">
              : ایمیل یا شماره همراه
            </label>
            <input
              type="text"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="student@example.com"
              className={`w-full p-3 rounded-xl border text-sm outline-none transition ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 focus:border-indigo-400"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500"
              }`}
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1 text-right font-bnaz">: رمز عبور</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className={`w-full p-3 rounded-xl border text-sm outline-none transition ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 focus:border-indigo-400"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500"
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 active:translate-y-0 mt-2"
          >
            {authMode === "login" ? "ورود به پنل" : "تکمیل ثبت‌نام"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          {authMode === "login" ? (
            <p className="text-slate-500 dark:text-slate-400 ">
              حساب کاربری ندارید؟{" "}
              <button
                onClick={() => setAuthMode("register")}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                ثبت‌نام کنید
              </button>
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <button
                onClick={() => setAuthMode("login")}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                وارد شوید
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}