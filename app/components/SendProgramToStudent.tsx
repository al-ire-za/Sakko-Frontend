"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  Upload,
  Trash2,
  CheckCircle,
  Loader2,
  FileText,
  User,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders, fixFileUrl } from "../utils/api";

interface Student {
  id: number;
  full_name?: string;
  username?: string;
  email?: string;
}

interface SentProgram {
  id: number;
  student: number;
  student_name?: string;
  title: string;
  description?: string;
  file?: string;
  created_at?: string;
}

interface SendProgramToStudentProps {
  isDarkMode: boolean;
}

export default function SendProgramToStudent({
  isDarkMode,
}: SendProgramToStudentProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [sentPrograms, setSentPrograms] = useState<SentProgram[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [loadingPrograms, setLoadingPrograms] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // دریافت لیست دانش‌آموزان اختصاص‌داده‌شده به مشاور
  const fetchMyStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/consultant/students/`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("خطا در دریافت لیست دانش‌آموزان:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // دریافت لیست برنامه‌های ارسال‌شده توسط این مشاور
  const fetchSentPrograms = useCallback(async () => {
    try {
      setLoadingPrograms(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/send-program/`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSentPrograms(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("خطا در دریافت برنامه‌های ارسال شده:", err);
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  useEffect(() => {
    fetchMyStudents();
    fetchSentPrograms();
  }, [fetchMyStudents, fetchSentPrograms]);

  // ارسال برنامه جدید
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (!selectedStudentId) return alert("لطفاً یک دانش‌آموز انتخاب کنید.");
    if (!title.trim()) return alert("لطفاً عنوان برنامه را وارد کنید.");
    if (!selectedFile) return alert("لطفاً فایل برنامه را پیوست کنید.");

    const formData = new FormData();
    formData.append("student_id", selectedStudentId);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("file", selectedFile);

    try {
      setSending(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/send-program/`, {
        method: "POST",
        headers: getAuthHeaders({}, false),
        body: formData,
      });

      if (res.ok) {
        setSuccessMsg("برنامه تحصیلی با موفقیت برای دانش‌آموز ارسال شد.");
        setTitle("");
        setDescription("");
        setSelectedFile(null);
        setSelectedStudentId("");
        fetchSentPrograms();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "خطا در ارسال برنامه.");
      }
    } catch (err) {
      console.error("خطا در ارسال برنامه:", err);
      alert("ارتباط با سرور برقرار نشد.");
    } finally {
      setSending(false);
    }
  };

  // حذف برنامه ارسال شده
  const handleDeleteProgram = async (programId: number) => {
    if (!confirm("آیا از حذف این برنامه اطمینان دارید؟")) return;

    try {
      setDeletingId(programId);
      const res = await fetch(
        `${API_BASE_URL}/api/accounts/send-program/${programId}/`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (res.ok) {
        setSentPrograms((prev) => prev.filter((p) => p.id !== programId));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "خطا در حذف برنامه.");
      }
    } catch (err) {
      console.error("خطا در حذف برنامه:", err);
      alert("ارتباط با سرور برقرار نشد.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-4 dir-rtl space-y-6" dir="rtl">
      {/* فرم ارسال برنامه */}
      <div
        className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 shadow-black/40 text-white"
            : "bg-white border-slate-200 shadow-slate-200/50 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-slate-800 border-slate-200">
          <div>
            <h2 className="text-lg font-bold">ارسال برنامه به شاگردان</h2>
            <p className="text-xs text-slate-400 mt-1">
              تنظیم و ارسال برنامه‌های هفتگی و راهبردی به همراه فایل پیوست
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* انتخاب دانش‌آموز */}
          <div>
            <label className="block text-xs font-bold mb-2">
              انتخاب دانش‌آموز هدف:
            </label>
            {loadingStudents ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span>در حال بارگذاری شاگردان...</span>
              </div>
            ) : students.length === 0 ? (
              <p className="text-xs text-amber-500">
                شما هنوز دانش‌آموزی در لیست خود ندارید.
              </p>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all cursor-pointer ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 focus:border-purple-500 text-white"
                    : "bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900"
                }`}
              >
                <option value="">یک دانش‌آموز را انتخاب کنید...</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.full_name || st.username || `دانش‌آموز کد ${st.id}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* عنوان برنامه */}
          <div>
            <label className="block text-xs font-bold mb-2">عنوان برنامه:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 focus:border-purple-500 text-white"
                  : "bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900"
              }`}
            />
          </div>

          {/* آپلود فایل برنامه */}
          <div>
            <label className="block text-xs font-bold mb-2">
              فایل پیوست برنامه (PDF, تصویر یا اکسل):
            </label>
            <label
              htmlFor="program-file-upload"
              className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950/50 hover:bg-slate-950 hover:border-purple-500"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-purple-500"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-4 pb-5 text-center px-4">
                <Upload className="w-7 h-7 mb-2 text-purple-500" />
                <p className="mb-1 text-xs font-semibold">
                  {selectedFile
                    ? selectedFile.name
                    : "برای انتخاب فایل کلیک کنید یا آن را بکشید"}
                </p>
                <p className="text-[10px] text-slate-400">
                  فرمت‌های مجاز: PDF, PNG, JPG, ZIP, XLSX (حداکثر ۲۰ مگابایت)
                </p>
              </div>
              <input
                id="program-file-upload"
                type="file"
                className="hidden"
                onChange={(e) =>
                  setSelectedFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </label>
          </div>

          {/* توضیحات تکمیلی */}
          <div>
            <label className="block text-xs font-medium mb-2 text-slate-400">
              توضیحات و نکات راهبردی برنامه (اختیاری):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 focus:border-purple-500 text-white"
                  : "bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900"
              }`}
            />
          </div>


          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={sending}
            className="w-full font-bold text-xs py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال ارسال برنامه...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>ارسال برنامه برای دانش‌آموز</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* لیست برنامه‌های ارسال شده */}
      {sentPrograms.length > 0 && (
        <div
          className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
            isDarkMode
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <h3 className="text-md font-bold mb-4 border-b pb-3 dark:border-slate-800 border-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-500" />
            <span>برنامه‌های ارسال‌شده اخیر ({sentPrograms.length})</span>
          </h3>

          <div className="space-y-3">
            {sentPrograms.map((program) => (
              <div
                key={program.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                  isDarkMode
                    ? "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold">{program.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
                      👤 {program.student_name || `دانش‌آموز کد ${program.student}`}
                    </span>
                  </div>

                  {program.description && (
                    <p className="text-[11px] text-slate-400">
                      {program.description}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">{program.created_at}</p>
                </div>

                <button
                  onClick={() => handleDeleteProgram(program.id)}
                  disabled={deletingId === program.id}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingId === program.id ? "در حال حذف..." : "حذف برنامه"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}