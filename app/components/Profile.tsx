"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  GraduationCap,
  Phone,
  BookOpen,
  Mail,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders, fixFileUrl, setSavedUser } from "../utils/api";

interface ProfileProps {
  isDarkMode: boolean;
  userData: any;
  onUserUpdate: () => void;
}

export default function Profile({
  isDarkMode,
  userData,
  onUserUpdate,
}: ProfileProps) {
  const isConsultant =
    userData?.role === "consultant" || userData?.is_consultant;

  const [formData, setFormData] = useState({
    firstName: userData?.first_name || "",
    lastName: userData?.last_name || "",
    email: userData?.email || "",
    age: userData?.age ? String(userData.age) : "",
    field: userData?.field || "تجربی",
    parentPhone: userData?.parentPhone || userData?.parent_phone || "",
    phone: userData?.phone || "",
    bio: userData?.bio || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    userData?.avatar ? fixFileUrl(userData.avatar) : null
  );

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.first_name || "",
        lastName: userData.last_name || "",
        email: userData.email || "",
        age: userData.age ? String(userData.age) : "",
        field: userData.field || "تجربی",
        parentPhone: userData.parentPhone || userData.parent_phone || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
      });
      if (userData.avatar) {
        setAvatarPreview(fixFileUrl(userData.avatar));
      }
    }
  }, [userData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const data = new FormData();
    data.append("first_name", formData.firstName.trim());
    data.append("last_name", formData.lastName.trim());
    data.append("email", formData.email.trim());

    if (!isConsultant) {
      if (formData.age) {
        data.append("age", formData.age);
      }
      data.append("field", formData.field);
      data.append("parent_phone", formData.parentPhone.trim());
    } else {
      data.append("phone", formData.phone.trim());
      data.append("bio", formData.bio.trim());
    }

    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/me/`, {
        method: "PATCH",
        headers: getAuthHeaders({}, false),
        body: data,
      });

      const resData = await res.json();

      if (res.ok) {
        setSavedUser(resData);
        setSuccessMsg("اطلاعات پروفایل شما با موفقیت ذخیره و به‌روزرسانی شد.");
        onUserUpdate();
      } else {
        const firstError = Object.values(resData)[0];
        const errorText = Array.isArray(firstError)
          ? firstError[0]
          : typeof firstError === "string"
          ? firstError
          : "خطا در ذخیره تغییرات.";
        setErrorMsg(errorText);
      }
    } catch (err) {
      console.error("خطا در ذخیره پروفایل:", err);
      setErrorMsg("خطا در برقراری ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4 dir-rtl space-y-6" dir="rtl">
      <div
        className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white shadow-black/40"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-slate-800 border-slate-200">
          <div>
            <h2 className="text-xl font-bold">ویرایش اطلاعات حساب کاربری</h2>
            <p className="text-xs text-slate-400 mt-1">
              مشخصات فردی و تحصیلی خود را مشاهده کرده و در صورت نیاز ویرایش نمایید.
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <User className="w-6 h-6" />
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* بخش تصویر پروفایل */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center shadow-lg">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-indigo-500">
                    {formData.firstName ? formData.firstName[0] : "پ"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -left-2 p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition cursor-pointer"
                title="تغییر تصویر"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="text-center sm:text-right space-y-1">
              <h3 className="font-bold text-sm">تصویر پروفایل</h3>
              <p className="text-xs text-slate-400">
                فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۵ مگابایت)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-indigo-500 font-bold hover:underline pt-1 inline-block cursor-pointer"
              >
                انتخاب تصویر جدید
              </button>
            </div>
          </div>

          {/* فیلدهای نام و نام خانوادگی */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-right">
                نام:
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full p-3.5 rounded-xl border text-sm outline-none transition text-right ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-right">
                نام خانوادگی:
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full p-3.5 rounded-xl border text-sm outline-none transition text-right ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* نام کاربری (غیرقابل ویرایش) و ایمیل */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-right text-slate-400">
                نام کاربری (غیرقابل تغییر):
              </label>
              <input
                type="text"
                disabled
                value={userData?.username || ""}
                className="w-full p-3.5 rounded-xl border text-sm opacity-60 cursor-not-allowed text-right bg-slate-200 dark:bg-slate-800 dark:border-slate-700 border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-right">
                ایمیل:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-3.5 rounded-xl border text-sm outline-none transition text-right ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                    : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* فیلدهای اختصاصی دانش‌آموز یا مشاور */}
          {!isConsultant ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-right">
                    سن:
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="100"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={`w-full p-3.5 rounded-xl border text-sm outline-none transition text-right ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-right">
                    رشته تحصیلی:
                  </label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleInputChange}
                    className={`w-full p-3.5 rounded-xl border text-sm outline-none transition text-right cursor-pointer ${
                      isDarkMode
                        ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                    }`}
                  >
                    <option value="تجربی">علوم تجربی</option>
                    <option value="ریاضی">ریاضی و فیزیک</option>
                    <option value="انسانی">علوم انسانی</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-right">
                  شماره همراه والدین:
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  className={`w-full p-3.5 rounded-xl border text-sm outline-none transition text-right ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                  }`}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold mb-1.5 text-right">
                  شماره تماس مشاور:
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full p-3.5 rounded-xl border text-sm outline-none transition text-right ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 text-right">
                  رزومه و سوابق مشاوره:
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className={`w-full p-3.5 rounded-xl border text-xs outline-none transition text-right ${
                    isDarkMode
                      ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                      : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-900"
                  }`}
                />
              </div>
            </>
          )}

          {/* دکمه ذخیره تغییرات */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال ذخیره تغییرات...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>ذخیره تغییرات پروفایل</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
