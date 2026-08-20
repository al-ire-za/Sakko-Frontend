"use client";

import React, { useState } from "react";
import { Sun, Moon, GraduationCap, UserCheck, Loader2 } from "lucide-react";
import { API_BASE_URL, setAuthTokens, setSavedUser } from "../utils/api";

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
  const [role, setRole] = useState<"student" | "consultant">("student");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
    field: "تجربی",
    parentPhone: "",
    phone: "",
    bio: "",
  });

  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const localErrors: Record<string, string[]> = {};

    if (!formData.username || formData.username.trim().length < 3) {
      localErrors.username = ["نام کاربری باید حداقل ۳ کاراکتر باشد."];
    }

    if (authMode === "register") {
      const phoneRegex = /^09\d{9}$/;
      if (role === "student" && formData.parentPhone && !phoneRegex.test(formData.parentPhone)) {
        localErrors.parentPhone = ["شماره همراه والدین باید ۱۱ رقم بوده و با ۰۹ شروع شود."];
      }
      if (role === "consultant" && formData.phone && !phoneRegex.test(formData.phone)) {
        localErrors.phone = ["شماره همراه مشاور باید ۱۱ رقم بوده و با ۰۹ شروع شود."];
      }

      const pwd = formData.password;
      const pwdErrors: string[] = [];
      if (pwd.length < 8) pwdErrors.push("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      if (!/[A-Za-z]/.test(pwd)) pwdErrors.push("رمز عبور باید شامل حداقل یک حرف انگلیسی باشد.");
      if (!/[0-9]/.test(pwd)) pwdErrors.push("رمز عبور باید شامل حداقل یک عدد باشد.");

      if (pwdErrors.length > 0) localErrors.password = pwdErrors;
    }

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setLoading(true);

    try {
      if (authMode === "login") {
        const res = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username.trim(),
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

        setAuthTokens(data.access, data.refresh);
        if (data.user) {
          setSavedUser(data.user);
        }
        onLoginSuccess(data);
      } else {
        const payload: Record<string, any> = {
          username: formData.username.trim(),
          password: formData.password,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          role: role,
        };

        if (role === "student") {
          payload.age = formData.age ? parseInt(formData.age, 10) : null;
          payload.field = formData.field;
          payload.parent_phone = formData.parentPhone.trim();
        } else {
          payload.phone = formData.phone.trim();
          payload.bio = formData.bio.trim();
        }

        const res = await fetch(`${API_BASE_URL}/api/accounts/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          const mappedErrors: Record<string, string[]> = {};

          if (data.username) {
            mappedErrors.username = data.username.map((msg: string) =>
              msg.includes("already exists") || msg.includes("وجود دارد")
                ? "کاربری با این شماره همراه یا نام کاربری قبلاً ثبت‌نام کرده است."
                : msg
            );
          }
          if (data.first_name) mappedErrors.firstName = Array.isArray(data.first_name) ? data.first_name : [data.first_name];
          if (data.last_name) mappedErrors.lastName = Array.isArray(data.last_name) ? data.last_name : [data.last_name];
          if (data.parent_phone) mappedErrors.parentPhone = Array.isArray(data.parent_phone) ? data.parent_phone : [data.parent_phone];
          if (data.phone) mappedErrors.phone = Array.isArray(data.phone) ? data.phone : [data.phone];
          if (data.password) mappedErrors.password = Array.isArray(data.password) ? data.password : [data.password];

          setFieldErrors(mappedErrors);
          return;
        }

        setAuthMode("login");
        setGeneralError("ثبت‌نام با موفقیت انجام شد! اکنون می‌توانید با اطلاعات خود وارد شوید.");
      }
    } catch (err: any) {
      setGeneralError("خطا در ارتباط با سرور. لطفاً از روشن بودن بک‌اند اطمینان حاصل کنید.");
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (fieldName: string) => {
    const err = fieldErrors[fieldName];
    if (!err || !Array.isArray(err) || err.length === 0) return null;
    return (
      <p className="text-[11px] text-red-400 mt-1 text-right font-medium">
        {err[0]}
      </p>
    );
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans ${
        isDarkMode
          ? "dark bg-gradient-to-b from-slate-950 to-slate-800 text-white"
          : "bg-gradient-to-t from-slate-100 to-white text-slate-800"
      }`}
      dir="rtl"
    >

      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-5 left-5 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-lg backdrop-blur-md transition-all hover:scale-105"
        title="تغییر تم"
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
            ? "bg-slate-900/90 border-slate-800 shadow-indigo-950/20"
            : "bg-white/95 border-slate-200 shadow-slate-200/50"
        }`}
      >
        <div className="text-center mb-6 flex flex-col items-center">
          <img src="/S.png" alt="Logo" className="w-20 h-20 mb-2 object-contain" />
          <h1 className="text-xl font-bold tracking-tight">
            {authMode === "login"
              ? "ورود به حساب کاربری سکو"
              : "ثبت‌نام در سامانه سکو"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === "login"
              ? "برای دسترسی به پنل کاربری اطلاعات خود را وارد کنید"
              : "نقش خود را انتخاب کرده و فرم را تکمیل نمایید"}
          </p>
        </div>

        {authMode === "register" && (
          <div className="flex p-1 rounded-2xl mb-5 bg-slate-100 dark:bg-slate-800/80 border dark:border-slate-700">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === "student"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-indigo-600"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>دانش‌آموز</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("consultant")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === "consultant"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-violet-600"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>مشاور تحصیلی</span>
            </button>
          </div>
        )}

        {generalError && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs text-center border font-medium ${
              generalError.includes("موفقیت")
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                fieldErrors.username ? "border-rose-500 focus:border-rose-500" : ""
              } ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
              }`}
            />
            {renderFieldError("username")}
          </div>

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
                      fieldErrors.firstName ? "border-rose-500" : ""
                    } ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
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
                      fieldErrors.lastName ? "border-rose-500" : ""
                    } ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                    }`}
                  />
                  {renderFieldError("lastName")}
                </div>
              </div>

              {role === "student" ? (
                <>
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
                          fieldErrors.age ? "border-rose-500" : ""
                        } ${
                          isDarkMode
                            ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
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
                            ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
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
                        fieldErrors.parentPhone ? "border-rose-500" : ""
                      } ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
                          : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                      }`}
                    />
                    {renderFieldError("parentPhone")}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-right">
                      شماره تماس مشاور:
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none transition text-right ${
                        fieldErrors.phone ? "border-rose-500" : ""
                      } ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
                          : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                      }`}
                    />
                    {renderFieldError("phone")}
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1 text-right">
                      رزومه و سوابق مشاوره:
                    </label>
                    <textarea
                      name="bio"
                      rows={2}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-xl border text-xs outline-none transition text-right ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
                          : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
                      }`}
                    />
                  </div>
                </>
              )}
            </>
          )}

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
                fieldErrors.password ? "border-rose-500 focus:border-rose-500" : ""
              } ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
                  : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800"
              }`}
            />
            {renderFieldError("password")}
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال پردازش...</span>
              </>
            ) : authMode === "login" ? (
              "ورود به پنل"
            ) : (
              "تکمیل ثبت‌نام"
            )}
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
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
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
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
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