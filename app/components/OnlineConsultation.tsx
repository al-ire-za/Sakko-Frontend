"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Star,
  Upload,
  FileText,
  Download,
  User,
  Loader2,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders, fixFileUrl } from "../utils/api";

interface Consultant {
  id: number;
  full_name: string;
  short_resume: string;
  average_rating: number;
  active_students_count: number;
  max_capacity: number;
  is_full?: boolean;
  img: string | null;
}

interface ConsultantProgram {
  id: number;
  title: string;
  file: string;
  file_name?: string;
  description: string;
  created_at: string;
}

interface OnlineConsultationProps {
  isDarkMode: boolean;
}

export default function OnlineConsultation({ isDarkMode }: OnlineConsultationProps) {
  const [hasConsultant, setHasConsultant] = useState<boolean | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [currentConsultantId, setCurrentConsultantId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // زیرتب مربوط به دانش‌آموز دارای مشاور ('upload' یا 'programs' یا 'rate')
  const [activeSubTab, setActiveSubTab] = useState<"upload" | "programs" | "rate">("upload");

  // استیت‌های ارسال فایل تمرین
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // استیت‌های دریافت برنامه از مشاور
  const [programs, setPrograms] = useState<ConsultantProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState<boolean>(false);

  // استیت‌های امتیازدهی به مشاور
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>("");
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  const fetchProfileAndConsultants = useCallback(async () => {
    try {
      setLoading(true);
      const profileRes = await fetch(`${API_BASE_URL}/api/accounts/me/`, {
        headers: getAuthHeaders(),
      });
      const profileData = await profileRes.json();

      const consultantId =
        profileData.consultant ||
        profileData.student_profile?.consultant ||
        profileData.student_profile?.consultant_id;

      if (consultantId) {
        setHasConsultant(true);
        setCurrentConsultantId(consultantId);
      } else {
        setHasConsultant(false);
        const listRes = await fetch(`${API_BASE_URL}/api/accounts/consultants/`, {
          headers: getAuthHeaders(),
        });
        const listData = await listRes.json();
        setConsultants(Array.isArray(listData) ? listData : listData.results || []);
      }
    } catch (err) {
      console.error("خطا در دریافت اطلاعات مشاور:", err);
      setConsultants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyPrograms = useCallback(async () => {
    try {
      setLoadingPrograms(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/my-programs/`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("خطا در دریافت برنامه‌ها:", err);
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndConsultants();
  }, [fetchProfileAndConsultants]);

  useEffect(() => {
    if (hasConsultant && activeSubTab === "programs") {
      fetchMyPrograms();
    }
  }, [activeSubTab, hasConsultant, fetchMyPrograms]);

  const handleSelectConsultant = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/select-consultant/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ consultant_id: id }),
      });

      if (res.ok) {
        await fetchProfileAndConsultants();
      } else {
        const err = await res.json();
        alert(err.error || "خطا در انتخاب مشاور");
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

    setUploadSuccess(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", description);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/upload-task/`, {
        method: "POST",
        headers: getAuthHeaders({}, false),
        body: formData,
      });

      if (res.ok) {
        setUploadSuccess("فایل با موفقیت برای مشاور شما ارسال شد.");
        setSelectedFile(null);
        setDescription("");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "خطا در ارسال فایل.");
      }
    } catch (err) {
      console.error("خطا در آپلود فایل:", err);
      alert("خطا در ارتباط با سرور.");
    } finally {
      setUploading(false);
    }
  };

  const handleRateConsultant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConsultantId) return;

    setIsSubmittingRating(true);
    setRatingSuccessMsg(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/accounts/consultants/${currentConsultantId}/rate/`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            score: ratingScore,
            comment: ratingComment.trim(),
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setRatingSuccessMsg(data.message || "امتیاز شما با موفقیت ثبت گردید.");
      } else {
        alert(data.error || "خطا در ثبت امتیاز.");
      }
    } catch (err) {
      console.error("خطا در ثبت امتیاز:", err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 dir-rtl" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-xs">در حال بارگذاری اطلاعات مشاوره...</span>
      </div>
    );
  }

  // ۱. اگر دانش‌آموز هنوز مشاور انتخاب نکرده است
  if (!hasConsultant) {
    return (
      <div className="w-full max-w-3xl mx-auto py-6 dir-rtl" dir="rtl">
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
            isDarkMode
              ? "bg-slate-900/90 border-slate-800 shadow-black/40"
              : "bg-white/95 border-slate-200 shadow-slate-200/50"
          }`}
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-violet-500/10 text-violet-500 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold dark:text-white text-slate-900">
              انتخاب مشاور تحصیلی تخصصی
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              جهت شروع مشاوره، یکی از مشاوران برتر زیر را انتخاب نمایید:
            </p>
          </div>

          {consultants.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
              در حال حاضر مشاوری برای انتخاب فعال نیست.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {consultants.map((c) => {
                const isFull =
                  c.is_full ||
                  (c.active_students_count || 0) >= (c.max_capacity || 10);
                const avatarSrc = fixFileUrl(c.img);

                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                      isDarkMode
                        ? "bg-slate-950/60 border-slate-800 hover:border-violet-500/50"
                        : "bg-slate-50 border-slate-200 hover:border-violet-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border dark:border-slate-700 border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={c.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-7 h-7 text-indigo-500" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-bold text-base ${
                              isDarkMode ? "text-white" : "text-slate-900"
                            }`}
                          >
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

                        <p className="text-xs text-slate-400 mt-1 max-w-sm line-clamp-2">
                          {c.short_resume || "مشاور تخصصی کنکور سراسری"}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isFull}
                      onClick={() => handleSelectConsultant(c.id)}
                      className={`w-full sm:w-auto shrink-0 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer ${
                        isFull
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-70 border border-slate-700"
                          : "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
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

  // ۲. اگر دانش‌آموز مشاور دارد
  return (
    <div className="w-full max-w-3xl mx-auto py-4 dir-rtl space-y-6" dir="rtl">
      {/* دکمه‌های سوئیچ زیرتب‌ها */}
      <div
        className={`flex p-1.5 rounded-2xl border ${
          isDarkMode
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <button
          onClick={() => setActiveSubTab("upload")}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "upload"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : isDarkMode
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>ارسال تکالیف و تمرینات</span>
        </button>

        <button
          onClick={() => setActiveSubTab("programs")}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "programs"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : isDarkMode
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>برنامه‌های دریافتی از مشاور</span>
        </button>

        <button
          onClick={() => setActiveSubTab("rate")}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "rate"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
              : isDarkMode
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Star className="w-4 h-4" />
          <span>امتیاز به مشاور</span>
        </button>
      </div>

      {/* تب ۱: ارسال تمرین */}
      {activeSubTab === "upload" && (
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white shadow-black/40"
              : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-slate-800 border-slate-200">
            <div>
              <h2 className="text-lg font-bold">ارسال فایل و تکالیف برای مشاور</h2>
              <p className="text-xs text-slate-400 mt-1">
                گزارش‌های مطالعاتی، حل تمرین یا نتایج آزمون‌های خود را جهت بررسی ارسال نمایید.
              </p>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-2xl">
              <Upload className="w-6 h-6" />
            </div>
          </div>

          {uploadSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleFileUpload} className="space-y-5">
            <div>
              <label
                htmlFor="student-file-upload"
                className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDarkMode
                    ? "border-slate-700 bg-slate-950/50 hover:bg-slate-950 hover:border-violet-500"
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-violet-500"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-8 h-8 mb-2 text-violet-500" />
                  <p className="mb-1 text-xs font-semibold">
                    {selectedFile
                      ? selectedFile.name
                      : "برای انتخاب فایل کلیک کنید یا آن را اینجا رها نمایید"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    فرمت‌های مجاز: PDF, PNG, JPG, ZIP, XLSX (حداکثر ۲۰ مگابایت)
                  </p>
                </div>
                <input
                  id="student-file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setSelectedFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 text-slate-400">
                توضیحات تکمیلی برای مشاور (اختیاری):
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 focus:border-violet-500 text-white"
                    : "bg-slate-50 border-slate-200 focus:border-violet-500 text-slate-900"
                }`}
              />

            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full font-bold text-xs py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ارسال فایل...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>تایید و ارسال برای مشاور</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* تب ۲: دریافت برنامه از مشاور */}
      {activeSubTab === "programs" && (
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white shadow-black/40"
              : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-slate-800 border-slate-200">
            <div>
              <h2 className="text-lg font-bold">برنامه‌های تحصیلی شما</h2>
              <p className="text-xs text-slate-400 mt-1">
                فایل‌ها و برنامه‌های هفتگی ارسال‌شده توسط مشاور خود را دانلود و مطالعه کنید.
              </p>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-500 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {loadingPrograms ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span>در حال دریافت برنامه‌ها...</span>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 dark:bg-slate-950/30 bg-slate-50 rounded-2xl border dark:border-slate-800/60 border-slate-200">
              هنوز برنامه‌ای از طرف مشاور برای شما بارگذاری نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {programs.map((prog) => {
                const fileUrl = fixFileUrl(prog.file);
                return (
                  <div
                    key={prog.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDarkMode
                        ? "bg-slate-950/60 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold">{prog.title}</h4>
                      {prog.description && (
                        <p className="text-xs text-slate-400 mt-1">{prog.description}</p>
                      )}
                      <p className="text-[10px] text-slate-500 mt-1">{prog.created_at}</p>
                    </div>

                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>دانلود برنامه</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* تب ۳: امتیازدهی به مشاور */}
      {activeSubTab === "rate" && (
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white shadow-black/40"
              : "bg-white border-slate-200 text-slate-900 shadow-slate-200/50"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-slate-800 border-slate-200">
            <div>
              <h2 className="text-lg font-bold">ثبت امتیاز و نظر برای مشاور</h2>
              <p className="text-xs text-slate-400 mt-1">
                کیفیت مشاوره، پیگیری و برنامه‌های ارسالی را ارزیابی نمایید.
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Star className="w-6 h-6" />
            </div>
          </div>

          {ratingSuccessMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{ratingSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleRateConsultant} className="space-y-5">
            <div>
              <label className="block text-xs font-bold mb-2">امتیاز شما (۱ تا ۵ ستاره):</label>
              <div className="flex items-center gap-2" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingScore
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-500"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-400 mr-2" dir="rtl">
                  ({ratingScore} از ۵)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 text-slate-400">
                نظر یا پیشنهاد شما (اختیاری):
              </label>
              <textarea
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 focus:border-amber-500 text-white"
                    : "bg-slate-50 border-slate-200 focus:border-amber-500 text-slate-900"
                }`}
              />

            </div>

            <button
              type="submit"
              disabled={isSubmittingRating}
              className="w-full font-bold text-xs py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmittingRating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ثبت امتیاز...</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-slate-950" />
                  <span>ثبت امتیاز و نظر</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}