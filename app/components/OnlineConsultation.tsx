"use client";

import React, { useEffect, useState } from "react";

interface Consultant {
  id: number;
  full_name: string;
  short_resume: string;
  average_rating: number;
  active_students_count: number;
  max_capacity: number;
  img: string | null;
}

interface OnlineConsultationProps {
  isDarkMode: boolean;
}

export default function OnlineConsultation({ isDarkMode }: OnlineConsultationProps) {
  const [hasConsultant, setHasConsultant] = useState<boolean | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchProfileAndConsultants();
  }, []);

  const fetchProfileAndConsultants = async () => {
    try {
      setLoading(true);
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
      console.error("خطا در دریافت اطلاعات:", err);
      setConsultants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConsultant = async (id: number) => {
    try {
      setLoading(true);
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
        await fetchProfileAndConsultants();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("خطا در انتخاب مشاور:", err);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("لطفاً یک فایل انتخاب کنید.");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", description);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/upload-task/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("فایل با موفقیت برای مشاور ارسال شد!");
        setSelectedFile(null);
        setDescription("");
      } else {
        alert("خطا در ارسال فایل.");
      }
    } catch (err) {
      console.error("خطا در آپلود فایل:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-xs text-slate-400 dir-rtl" dir="rtl">
        در حال دریافت اطلاعات...
      </div>
    );
  }

  // ۱. اگر دانش‌آموز هنوز مشاور انتخاب نکرده
  if (!hasConsultant) {
    return (
      <div className="w-full max-w-2xl mx-auto py-6 dir-rtl" dir="rtl">
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
            <div className="flex flex-col gap-4">
              {consultants.map((c) => {
                const isFull = (c.active_students_count || 0) >= (c.max_capacity || 10);
                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      isDarkMode
                        ? "bg-slate-950/60 border-slate-800 hover:border-violet-600"
                        : "bg-slate-50 border-slate-200 hover:border-violet-600"
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-14 h-14 rounded-2xl dark:bg-slate-800 bg-white border dark:border-slate-700 border-black/20 overflow-hidden flex items-center justify-center shrink-0">
                        {c.img ? (
                          <img src={c.img} alt={c.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`font-bold text-base ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                            {c.full_name}
                          </h3>

                          <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 font-medium">
                            ⭐ {c.average_rating ? Number(c.average_rating).toFixed(1) : "جدید"}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium ${
                              isFull
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            }`}
                          >
                            👥 {c.active_students_count || 0} از {c.max_capacity || 10}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1 max-w-sm line-clamp-1">
                          {c.short_resume || "بدون رزومه ثبت‌شده"}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isFull}
                      onClick={() => handleSelectConsultant(c.id)}
                      className={`w-full sm:w-auto shrink-0 font-medium text-xs px-6 py-3 rounded-xl transition-all ${
                        isFull
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-70 border border-slate-700"
                          : "bg-violet-600 hover:bg-violet-800 text-white shadow-lg shadow-fuchsia-900/20"
                      }`}
                    >
                      {isFull ? "تکمیل ظرفیت" : "انتخاب مشاور"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ۲. اگر دانش‌آموز مشاور دارد (باکس ارسال فایل)
  return (
    <div className="w-full max-w-3xl mx-auto py-4 dir-rtl" dir="rtl">
      <div
        className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 shadow-black/40 text-white"
            : "bg-white border-slate-200 shadow-slate-200/50 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-slate-800 border-slate-200">
          <div>
            <h2 className="text-lg font-bold">ارسال فایل و تمرینات برای مشاور</h2>
            <p className="text-xs text-slate-400 mt-1">
              تمرین‌ها، گزارش کار یا نتایج تست‌های خود را برای بررسی مشاور آپلود کنید.
            </p>
          </div>
          <span className="text-2xl">📤</span>
        </div>

        <form onSubmit={handleFileUpload} className="space-y-5">
          <div className="relative">
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950/50 hover:bg-slate-950 hover:border-violet-600"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-violet-600"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <span className="text-3xl mb-2">📁</span>
                <p className="mb-1 text-xs font-semibold">
                  {selectedFile ? selectedFile.name : "برای انتخاب فایل کلیک کنید یا آن را اینجا بکشید"}
                </p>
                <p className="text-[10px] text-slate-400">
                  فرمت‌های مجاز: PDF, PNG, JPG, ZIP (حداکثر ۲۰ مگابایت)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 text-slate-400">
              توضیحات یا یادداشت برای مشاور (اختیاری):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: حل تمرین‌های فصل ۲ زیست‌شناسی + تست‌های مبحث تابع..."
              className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 focus:border-violet-600 text-white placeholder-slate-600"
                  : "bg-slate-50 border-slate-200 focus:border-violet-600 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full font-medium text-xs py-3.5 rounded-xl bg-violet-600 hover:bg-violet-800 text-white shadow-lg shadow-fuchsia-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{uploading ? "در حال ارسال..." : "تایید و ارسال برای مشاور"}</span>
            <span>🚀</span>
          </button>
        </form>
      </div>
    </div>
  );
}