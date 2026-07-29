"use client";

import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";

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
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
    field: "تجربی",
    parentPhone: "",
  });

  // ذخیره خطاهای کلی و خطاهای تفکیک شده هر فیلد
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // با تایپ کاربر، خطای آن فیلد پاک می‌شود
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const localErrors: Record<string, string[]> = {};

    // 1. اعتبارسنجی نام کاربری (می‌تواند نام کاربری متنی یا شماره موبایل باشد)
    if (!formData.username || formData.username.trim().length < 3) {
      localErrors.username = ["نام کاربری باید حداقل ۳ کاراکتر باشد."];
    }

    if (authMode === "register") {
      // 2. اعتبارسنجی شماره همراه والدین (حتماً باید ۱۱ رقم و با ۰۹ شروع شود)
      const phoneRegex = /^09\d{9}$/;
      if (formData.parentPhone && !phoneRegex.test(formData.parentPhone)) {
        localErrors.parentPhone = ["شماره همراه والدین باید ۱۱ رقم بوده و با ۰۹ شروع شود."];
      }

      // 3. اعتبارسنجی رمز عبور
      const pwd = formData.password;
      const pwdErrors: string[] = [];
      if (pwd.length < 8) pwdErrors.push("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      if (!/[A-Za-z]/.test(pwd)) pwdErrors.push("رمز عبور باید شامل حداقل یک حرف انگلیسی باشد.");
      if (!/[0-9]/.test(pwd)) pwdErrors.push("رمز عبور باید شامل حداقل یک عدد باشد.");

      if (pwdErrors.length > 0) localErrors.password = pwdErrors;
    }

    // اگر خطای فرانت‌انداز وجود داشت، درخواست به سرور فرستاده نمی‌شود
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setLoading(true);

    try {
      if (authMode === "login") {
        const res = await fetch("http://127.0.0.1:8000/api/accounts/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.detail) {
            setGeneralError("نام کاربری یا رمز عبور اشتباه است.");
          } else {
            setFieldErrors(data);
          }
          return;
        }

        localStorage.setItem("token", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        onLoginSuccess(data.access);
      } else {
        const res = await fetch("http://127.0.0.1:8000/api/accounts/register/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: formData.age ? parseInt(formData.age) : null,
            field: formData.field,
            parent_phone: formData.parentPhone,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          const mappedErrors: Record<string, string[]> = {};

          // نگاشت و فارسی‌سازی خطاهای پیش‌فرض جنگو
          if (data.username) {
            mappedErrors.username = data.username.map((msg: string) =>
              msg.includes("already exists") || msg.includes("وجود دارد")
                ? "کاربری با این شماره همراه قبلاً ثبت‌نام کرده است."
                : msg
            );
          }
          if (data.first_name) mappedErrors.firstName = data.first_name;
          if (data.last_name) mappedErrors.lastName = data.last_name;
          if (data.parent_phone) mappedErrors.parentPhone = data.parent_phone;
          if (data.password) mappedErrors.password = data.password;

          setFieldErrors({ ...data, ...mappedErrors });
          return;
        }

        setAuthMode("login");
        setGeneralError("ثبت‌نام با موفقیت انجام شد! حالا وارد شوید.");
      }
    } catch (err: any) {
      setGeneralError("خطا در ارتباط با سرور. لطفاً مجدداً تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  // تابع کمکی برای نمایش خطا زیر هر فیلد
  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName] || fieldErrors[fieldName].length === 0) return null;
    return (
      <p className="text-[11px] text-red-400 mt-1 text-right">
        {fieldErrors[fieldName][0]}
      </p>
    );
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDarkMode
          ? "dark bg-gradient-to-b from bg-slate-950 to-slate-700 text-white"
          : "bg-gradient-to-t from bg-white/60 to-white text-slate-800"
      }`}
      dir="rtl"
    >
      {/* دکمه سوئیچ تم */}
      <button
        type="button"
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
        <div className="text-center mb-6 flex flex-col items-center">
          <img src="S.png" alt="Logo" className="w-20 h-20 mb-2" />
          <h1 className="text-xl font-bold tracking-tight">
            {authMode === "login"
              ? "ورود به حساب دانش‌آموز"
              : "ثبت‌نام دانش‌آموز جدید"}
          </h1>
        </div>

        {/* پیام عمومی (ارور شبکه یا پیام موفقیت) */}
        {generalError && (
          <div className="mb-4 p-3 rounded-xl text-xs text-center border bg-indigo-500/10 border-indigo-500/20 text-indigo-300">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* نام کاربری */}
          <div>
            <label className="text-xs font-bold block mb-1 text-right">
              نام کاربری / شماره همراه:
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleInputChange}
              
              className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                fieldErrors.username ? "border-red-500 focus:border-red-500" : ""
              } ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 focus:border-indigo-400 text-white"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
              }`}
            />
            {renderFieldError("username")}
          </div>

          {/* فیلدهای اختصاصی ثبت‌نام */}
          {authMode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold block mb-1 text-right">
                    نام:
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    
                    className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                      fieldErrors.firstName ? "border-red-500" : ""
                    } ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 focus:border-indigo-400 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                    }`}
                  />
                  {renderFieldError("firstName")}
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-right">
                    نام خانوادگی:
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                   
                    className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                      fieldErrors.lastName ? "border-red-500" : ""
                    } ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 focus:border-indigo-400 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                    }`}
                  />
                  {renderFieldError("lastName")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold block mb-1 text-right">
                    سن:
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    
                    className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                      fieldErrors.age ? "border-red-500" : ""
                    } ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 focus:border-indigo-400 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                    }`}
                  />
                  {renderFieldError("age")}
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-right">
                    رشته تحصیلی:
                  </label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 focus:border-indigo-400 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                    }`}
                  >
                    <option value="تجربی">تجربی</option>
                    <option value="ریاضی">ریاضی</option>
                    <option value="انسانی">انسانی</option>
                  </select>
                  {renderFieldError("field")}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-right">
                  شماره همراه والدین:
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  
                  className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                    fieldErrors.parentPhone ? "border-red-500" : ""
                  } ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 focus:border-indigo-400 text-white"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                  }`}
                />
                {renderFieldError("parentPhone")}
              </div>
            </>
          )}

          {/* رمز عبور */}
          <div>
            <label className="text-xs font-bold block mb-1 text-right">
              رمز عبور:
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
             
              className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                fieldErrors.password ? "border-red-500 focus:border-red-500" : ""
              } ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 focus:border-indigo-400 text-white"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
              }`}
            />
            {renderFieldError("password")}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-50"
          >
            {loading
              ? "در حال پردازش..."
              : authMode === "login"
              ? "ورود به پنل"
              : "تکمیل ثبت‌نام"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          {authMode === "login" ? (
            <p className="text-slate-500 dark:text-slate-400">
              حساب کاربری ندارید؟{" "}
              <button
                type="button"
                onClick={() => {
                  setGeneralError("");
                  setFieldErrors({});
                  setAuthMode("register");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                ثبت‌نام کنید
              </button>
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <button
                type="button"
                onClick={() => {
                  setGeneralError("");
                  setFieldErrors({});
                  setAuthMode("login");
                }}
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