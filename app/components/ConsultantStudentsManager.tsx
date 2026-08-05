"use client";

import React, { useEffect, useState } from "react";

interface TaskFile {
  id: number;
  file: string;
  file_name: string;
  description: string;
  created_at: string;
}

interface StudentData {
  student_id: number;
  student_name: string;
  field: string;
  files: TaskFile[];
}

interface ConsultantStudentsManagerProps {
  isDarkMode: boolean;
}

export default function ConsultantStudentsManager({ isDarkMode }: ConsultantStudentsManagerProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    fetchConsultantStudents();
  }, []);

  const fetchConsultantStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/accounts/consultant-students/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
      if (list.length > 0) {
        setSelectedStudent(list[0]);
      }
    } catch (err) {
      console.error("خطا در دریافت اطلاعات شاگردان:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-xs text-slate-400 dir-rtl" dir="rtl">
        در حال دریافت لیست دانش‌آموزان...
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-6 dir-rtl" dir="rtl">
      <div
        className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 shadow-black/40 text-white"
            : "bg-white border-slate-200 shadow-slate-200/50 text-slate-900"
        }`}
      >
        {/* هدر بخش مدیریت مشاور */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 dark:border-slate-800 border-slate-200">
          <div>
            <h2 className="text-lg font-bold">مدیریت دانش‌آموزان</h2>
            <p className="text-xs text-slate-400 mt-1">
              مشاهده گزارش، وضعیت شاگردان و دانلود تمرینات ارسالی آن‌ها
            </p>
          </div>
          <span className="text-2xl">👥</span>
        </div>

        {students.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
            هنوز دانش‌آموزی شما را به عنوان مشاور انتخاب نکرده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ستون راست: لیست دانش‌آموزان */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 mb-2">لیست شاگردان شما</h3>
              {students.map((st) => (
                <div
                  key={st.student_id}
                  onClick={() => setSelectedStudent(st)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedStudent?.student_id === st.student_id
                      ? "bg-emerald-500/10 border-emerald-500 text-white"
                      : isDarkMode
                      ? "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div>
                    <p className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {st.student_name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">رشته: {st.field || "نامشخص"}</p>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {st.files.length} فایل
                  </span>
                </div>
              ))}
            </div>

            {/* ستون چپ: فایل‌های دانش‌آموز انتخاب‌شده */}
            <div
              className={`md:col-span-2 p-5 rounded-2xl border ${
                isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              {selectedStudent && (
                <>
                  <div className="border-b border-slate-800/60 pb-3 mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-sm">
                      فایل‌های ارسالی: <span className="text-emerald-400">{selectedStudent.student_name}</span>
                    </h3>
                  </div>

                  {selectedStudent.files.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12">
                      این دانش‌آموز هنوز فایلی ارسال نکرده است.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {selectedStudent.files.map((f) => (
                        <div
                          key={f.id}
                          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-medium dir-ltr text-right">📁 {f.file_name}</p>
                            {f.description && (
                              <p className="text-xs text-slate-400 mt-1">توضیحات: {f.description}</p>
                            )}
                            <p className="text-[10px] text-slate-500">{f.created_at}</p>
                          </div>

                          <a
                            href={f.file}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl transition-all text-center"
                          >
                            دانلود فایل
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}