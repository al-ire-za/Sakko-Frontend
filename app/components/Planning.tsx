"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar as CalendarIcon,
  BookOpen,
  Loader2,
} from "lucide-react";
import ExamCountdown from "./ExamCountdown";
import {
  API_BASE_URL,
  getAuthHeaders,
  formatDateToKey,
  formatPersianDate,
} from "../utils/api";

interface PlanningProps {
  isDarkMode: boolean;
}

interface Task {
  id: string | number;
  text: string;
  completed: boolean;
  date?: string;
}

export default function Planning({ isDarkMode }: PlanningProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newTaskText, setNewTaskText] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

  const currentDateKey = formatDateToKey(currentDate);

  // ۱. دریافت کارهای روز جاری از بک‌اند
  const fetchTasks = useCallback(async (dateStr: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/?date=${dateStr}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error("خطا در دریافت لیست کارها:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(currentDateKey);
  }, [currentDateKey, fetchTasks]);

  // ۲. افزودن کار جدید به دیتابیس
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          text: newTaskText.trim(),
          date: currentDateKey,
          completed: false,
        }),
      });

      if (response.ok) {
        const createdTask = await response.json();
        setTasks((prev) => [...prev, createdTask]);
        setNewTaskText("");
      }
    } catch (error) {
      console.error("خطا در ایجاد کار جدید:", error);
    }
  };

  // ۳. تغییر وضعیت انجام کار (تیک زدن)
  const toggleTask = async (taskId: string | number, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentStatus } : t))
    );

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) {
        fetchTasks(currentDateKey);
      }
    } catch (error) {
      console.error("خطا در تغییر وضعیت کار:", error);
      fetchTasks(currentDateKey);
    }
  };

  // ۴. حذف کار از دیتابیس
  const deleteTask = async (taskId: string | number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        fetchTasks(currentDateKey);
      }
    } catch (error) {
      console.error("خطا در حذف کار:", error);
      fetchTasks(currentDateKey);
    }
  };

  // ۵. ذخیره ویرایش متن کار
  const saveEditing = async (taskId: string | number) => {
    if (!editingText.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: editingText.trim() }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, text: editingText.trim() } : t))
        );
        setEditingTaskId(null);
      }
    } catch (error) {
      console.error("خطا در ویرایش کار:", error);
    }
  };

  const handlePrevDay = () => {
    setSlideDirection("right");
    setTimeout(() => {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
      setSlideDirection(null);
    }, 150);
  };

  const handleNextDay = () => {
    setSlideDirection("left");
    setTimeout(() => {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
      setSlideDirection(null);
    }, 150);
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 dir-rtl" dir="rtl">
      {/* هدر دفترچه و شمارش معکوس کنکور */}
      <ExamCountdown isDarkMode={isDarkMode} currentDate={currentDate} />

      {/* کنترل تاریخ روزها */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="hidden sm:inline">روز قبلی</span>
        </button>

        <div className="flex items-center gap-2 text-sm sm:text-base font-bold">
          <CalendarIcon className="w-5 h-5 text-indigo-500 shrink-0" />
          <span>{formatPersianDate(currentDate)}</span>
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <span className="hidden sm:inline">روز بعدی</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* بدنه اصلی دفترچه برنامه ریزی */}
      <div
        className={`relative rounded-3xl border shadow-xl p-6 sm:p-8 transition-all duration-300 overflow-hidden ${
          slideDirection === "left"
            ? "translate-x-full opacity-0"
            : slideDirection === "right"
            ? "-translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        } ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-800 shadow-slate-200/50"
        }`}
      >
        {/* عنوان و آمار */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-indigo-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold">برنامه روزانه من</h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700">
            {completedCount} از {tasks.length} انجام شده
          </span>
        </div>

        {/* فرم اضافه کردن کار جدید */}
        <form onSubmit={handleAddTask} className="relative z-10 flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className={`flex-1 p-3 rounded-xl border text-sm outline-none transition text-right ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 focus:border-indigo-400 text-white"
                : "bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800 shadow-sm"
            }`}
          />
          <button

            type="submit"
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition flex items-center gap-1 text-sm font-bold cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">افزودن</span>
          </button>
        </form>

        {/* لیست کارهای دریافتی از دیتابیس */}
        <div className="relative z-10 space-y-3 min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span>در حال بارگذاری کارها...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              هیچ کاری برای این روز ثبت نشده است. اولین کار را اضافه کنید!
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  task.completed
                    ? "opacity-60 bg-emerald-500/5 border-emerald-500/20"
                    : isDarkMode
                    ? "bg-slate-800/80 border-slate-700/80 hover:border-slate-600"
                    : "bg-white/90 border-slate-200/80 hover:border-indigo-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 ml-2">
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      task.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </button>

                  {editingTaskId === task.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className={`w-full p-1.5 rounded-lg border text-sm outline-none ${
                          isDarkMode
                            ? "bg-slate-700 border-indigo-400 text-white"
                            : "bg-slate-50 border-indigo-500 text-slate-900"
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditing(task.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        title="ذخیره"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="انصراف"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`text-sm cursor-pointer truncate ${
                        task.completed
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-800 dark:text-slate-200 font-medium"
                      }`}
                    >
                      {task.text}
                    </span>
                  )}
                </div>

                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                      title="ویرایش"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}