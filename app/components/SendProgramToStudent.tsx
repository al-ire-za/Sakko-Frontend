"use client";

import React, { useEffect, useState } from "react";

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

export default function SendProgramToStudent({ isDarkMode }: SendProgramToStudentProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [sentPrograms, setSentPrograms] = useState<SentProgram[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [loadingPrograms, setLoadingPrograms] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchMyStudents();
    fetchSentPrograms();
  }, []);

  // دریافت لیست دانش‌آموزان اختصاص‌داده‌شده به مشاور
  const fetchMyStudents = async () => {
    try {
      setLoadingStudents(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/consultant/students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setStudents(data);
      } else if (Array.isArray(data.results)) {
        setStudents(data.results);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("خطا در دریافت لیست دانش‌آموزان:", err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // دریافت لیست برنامه‌های ارسال‌شده توسط این مشاور
  const fetchSentPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/send-program/`, {
        headers: { Authorization: `Bearer ${token}` },
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
  };

  // ارسال برنامه جدید
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) return alert("لطفاً یک دانش‌آموز انتخاب کنید.");
    if (!title.trim()) return alert("لطفاً عنوان برنامه را وارد کنید.");
    if (!selectedFile) return alert("لطفاً فایل برنامه را پیوست کنید.");

    const formData = new FormData();
    formData.append("student_id", selectedStudentId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", selectedFile);

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/send-program/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("برنامه تحصیلی با موفقیت برای دانش‌آموز ارسال شد!");
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
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/send-program/${programId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("برنامه با موفقیت حذف شد.");
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
              تنظیم و ارسال برنامه‌های هفتگی و راهبردی برای دانش‌آموزان خود.
            </p>
          </div>
          <span className="text-2xl">📋</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* انتخاب دانش‌آموز */}
          <div>
            <label className="block text-xs font-medium mb-2 text-slate-400">
              انتخاب دانش‌آموز:
            </label>
            {loadingStudents ? (
              <p className="text-xs text-slate-500 py-2">در حال دریافت لیست دانش‌آموزان...</p>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                  isDarkMode
                    ? "bg-slate-950 border-slate-800 focus:border-violet-600 text-white"
                    : "bg-slate-50 border-slate-200 focus:border-violet-600 text-slate-900"
                }`}
              >
                <option value="">لطفاً یک دانش‌آموز را انتخاب کنید...</option>
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
            <label className="block text-xs font-medium mb-2 text-slate-400">
              عنوان برنامه:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: برنامه هفتگی هفته سوم مردادماه"
              className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 focus:border-violet-600 text-white placeholder-slate-600"
                  : "bg-slate-50 border-slate-200 focus:border-violet-600 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          {/* آپلود فایل برنامه */}
          <div>
            <label className="block text-xs font-medium mb-2 text-slate-400">
              فایل برنامه (PDF, تصویر یا زیپ):
            </label>
            <label
              htmlFor="program-file-upload"
              className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isDarkMode
                  ? "border-slate-700 bg-slate-950/50 hover:bg-slate-950 hover:border-violet-600"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-violet-600"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-4 pb-5 text-center px-4">
                <span className="text-2xl mb-2">📄</span>
                <p className="mb-1 text-xs font-semibold">
                  {selectedFile ? selectedFile.name : "برای کلیک یا کشیدن فایل برنامه کلیک کنید"}
                </p>
                <p className="text-[10px] text-slate-400">
                  فرمت‌های مجاز: PDF, PNG, JPG, ZIP (حداکثر ۲۰ مگابایت)
                </p>
              </div>
              <input
                id="program-file-upload"
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              />
            </label>
          </div>

          {/* توضیحات تکمیلی */}
          <div>
            <label className="block text-xs font-medium mb-2 text-slate-400">
              توضیحات و نکات برنامه (اختیاری):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="نکات مهم مربوط به اجرای برنامه، اولویت دروس و..."
              className={`w-full p-3.5 text-xs rounded-xl border outline-none transition-all ${
                isDarkMode
                  ? "bg-slate-950 border-slate-800 focus:border-violet-600 text-white placeholder-slate-600"
                  : "bg-slate-50 border-slate-200 focus:border-violet-600 text-slate-900 placeholder-slate-400"
              }`}
            />
          </div>

          {/* دکمه ارسال */}
          <button
            type="submit"
            disabled={sending}
            className="w-full font-medium text-xs py-3.5 rounded-xl bg-violet-600 hover:bg-violet-800 text-white shadow-lg shadow-fuchsia-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{sending ? "در حال ارسال برنامه..." : "ارسال برنامه برای دانش‌آموز"}</span>
            <span>🚀</span>
          </button>
        </form>
      </div>

      {/* لیست برنامه‌های ارسال شده و امکان حذف آن‌ها */}
        {sentPrograms.length > 0 && (
        <div
            className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
            isDarkMode
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
        >
            <h3 className="text-md font-bold mb-4 border-b pb-3 dark:border-slate-800 border-slate-200">
            برنامه‌های ارسال‌شده اخیر
            </h3>
            <div className="space-y-3">
            {sentPrograms.map((program) => (
                <div
                key={program.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isDarkMode
                    ? "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
                >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold">{program.title}</h4>
                    
                    {/* 🌟 نشانگر نام دانش‌آموز */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 font-semibold border border-violet-500/20">
                        👤 {program.student_name || `دانش‌آموز کد ${program.student}`}
                    </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                    {program.description || "بدون توضیح"}
                    </p>
                </div>

                <button
                    onClick={() => handleDeleteProgram(program.id)}
                    disabled={deletingId === program.id}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                    {deletingId === program.id ? "در حال حذف..." : "حذف 🗑️"}
                </button>
                </div>
            ))}
            </div>
        </div>
        )}
    </div>
  );
}