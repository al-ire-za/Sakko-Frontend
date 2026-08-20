"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, FileText, Download, Loader2, User } from "lucide-react";
import { API_BASE_URL, getAuthHeaders, fixFileUrl } from "../utils/api";

interface TaskFile {
  id: number;
  file?: string;
  file_url?: string;
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

export default function ConsultantStudentsManager({
  isDarkMode,
}: ConsultantStudentsManagerProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchConsultantStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/accounts/consultant-students/`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setStudents(list);
      if (list.length > 0) {
        setSelectedStudent(list[0]);
      }
    } catch (err) {
      console.error("خطا در دریافت اطلاعات شاگردان:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultantStudents();
  }, [fetchConsultantStudents]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3 dir-rtl" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="text-xs">در حال دریافت لیست دانش‌آموزان...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-4 dir-rtl" dir="rtl">
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
            <h2 className="text-lg font-bold">مدیریت شاگردان</h2>
            <p className="text-xs text-slate-400 mt-1">
              مشاهده وضعیت دانش‌آموزان تحت پوشش و بررسی تکالیف و تمرین‌های ارسالی آن‌ها
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 dark:bg-slate-950/40 bg-slate-50 rounded-2xl border dark:border-slate-800 border-slate-200">
            هنوز دانش‌آموزی شما را به عنوان مشاور انتخاب نکرده است.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ستون راست: لیست دانش‌آموزان */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 mb-2">لیست شاگردان شما ({students.length})</h3>
              {students.map((st) => (
                <div
                  key={st.student_id}
                  onClick={() => setSelectedStudent(st)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedStudent?.student_id === st.student_id
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : isDarkMode
                      ? "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                      {st.student_name ? st.student_name[0] : "د"}
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {st.student_name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">رشته: {st.field || "نامشخص"}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
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
                  <div className="border-b dark:border-slate-800/60 border-slate-200 pb-3 mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-sm">
                      تکالیف ارسالی دانش‌آموز: <span className="text-emerald-400 font-extrabold">{selectedStudent.student_name}</span>
                    </h3>
                    <span className="text-xs text-slate-400">
                      رشته {selectedStudent.field || "مشخص‌نشده"}
                    </span>
                  </div>

                  {selectedStudent.files.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-16">
                      این دانش‌آموز هنوز فایلی ارسال نکرده است.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {selectedStudent.files.map((f) => {
                        const downloadUrl = fixFileUrl(f.file || f.file_url);
                        return (
                          <div
                            key={f.id}
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isDarkMode
                                ? "bg-slate-900 border-slate-800"
                                : "bg-white border-slate-200 shadow-sm"
                            }`}
                          >
                            <div className="space-y-1">
                              <p className="text-xs font-bold flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                <span>{f.file_name || "فایل تمرین"}</span>
                              </p>
                              {f.description && (
                                <p className="text-xs text-slate-400 mt-1">
                                  توضیحات: {f.description}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-500">{f.created_at}</p>
                            </div>

                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                              <span>دانلود فایل</span>
                            </a>
                          </div>
                        );
                      })}
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