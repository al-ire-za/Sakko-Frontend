"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import ExamCountdown from "./ExamCountdown";

interface PlanningProps {
  isDarkMode: boolean;
  
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface DayPlan {
  [dateKey: string]: Task[];
}

export default function Planning({ isDarkMode }: PlanningProps) {
  // تاریخ فعلی به عنوان نقطه شروع
  const [currentDate, setCurrentDate] = useState(new Date());

  // ذخیره کارهای روزهای مختلف بر اساس کلید تاریخ (YYYY-MM-DD)
  const [plans, setPlans] = useState<DayPlan>({
    [getFormattedDate(new Date())]: [
      { id: "1", text: "زیست‌شناسی - فصل ۲ (۴۰ تست)", completed: true },
      { id: "2", text: "شیمی - حل مسائل استوکیومتری", completed: false },
      { id: "3", text: "مرور لغات زبان انگلیسی درس اول", completed: false },
    ],
  });

  const [newTaskText, setNewTaskText] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

  // تبدیل تاریخ به کلید یکتا برای ذخیره‌سازی
  function getFormattedDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  // گرفتن تاریخ شمسی فرمت‌شده
  function getPersianDateDetails(date: Date) {
  const weekday = new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(date);
  const day = new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(date);
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(date);

  // چیدمان دقیق طبق خواسته شما: جمعه ، ۲ مرداد ، ۱۴۰۵
  return `${weekday} ، ${day} ${month} ، ${year}`;
}

  const currentDateKey = getFormattedDate(currentDate);
  const currentTasks = plans[currentDateKey] || [];

  // تعویض روزها (ورق زدن)
  const handlePrevDay = () => {
    setSlideDirection("right");
    setTimeout(() => {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
      setSlideDirection(null);
    }, 200);
  };

  const handleNextDay = () => {
    setSlideDirection("left");
    setTimeout(() => {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
      setSlideDirection(null);
    }, 200);
  };

  // افزودن کار جدید
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };

    setPlans((prev) => ({
      ...prev,
      [currentDateKey]: [...(prev[currentDateKey] || []), newTask],
    }));

    setNewTaskText("");
  };

  // تغییر وضعیت انجام کار (تیک زدن)
  const toggleTask = (taskId: string) => {
    setPlans((prev) => ({
      ...prev,
      [currentDateKey]: prev[currentDateKey].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  // حذف کار
  const deleteTask = (taskId: string) => {
    setPlans((prev) => ({
      ...prev,
      [currentDateKey]: prev[currentDateKey].filter((task) => task.id !== taskId),
    }));
  };

  // شروع ویرایش
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  // ذخیره ویرایش
  const saveEditing = (taskId: string) => {
    if (!editingText.trim()) return;
    setPlans((prev) => ({
      ...prev,
      [currentDateKey]: prev[currentDateKey].map((task) =>
        task.id === taskId ? { ...task, text: editingText.trim() } : task
      ),
    }));
    setEditingTaskId(null);
  };

  // آمار کارهای روز
  const completedCount = currentTasks.filter((t) => t.completed).length;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 dir-rtl" dir="rtl">
      {/* هدر دفترچه و کنترل روزها */}
      <ExamCountdown isDarkMode={isDarkMode} currentDate={currentDate} />
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm transition-colors ${
          isDarkMode
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition flex items-center gap-1 text-xs font-bold"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="hidden sm:inline">روز قبلی</span>
          
        </button>

        <div className="flex items-center gap-2 text-sm sm:text-base font-bold" dir="rtl">
            <CalendarIcon className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>{getPersianDateDetails(currentDate)}</span>
        </div>

        

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition flex items-center gap-1 text-xs font-bold"
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
            : "bg-amber-50/40 border-amber-200/60 text-slate-800 shadow-amber-900/5"
        }`}
      >
        {/* خط قرمز حاشیه دفترچه (مشابه دفترچه‌های خط‌دار واقعی) */}
        

        {/* عنوان و آمار */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-indigo-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold">برنامه روزانه من</h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700">
            {completedCount} از {currentTasks.length} انجام شده
          </span>
        </div>

        {/* فرم اضافه کردن کار جدید */}
        <form onSubmit={handleAddTask} className="relative z-10 flex gap-2 mb-6">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="کار جدیدی برای امروز بنویس..."
            className={`flex-1 p-3 rounded-xl border text-sm outline-none transition text-right placeholder:text-right ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 focus:border-indigo-400"
                : "bg-white border-slate-200 focus:border-indigo-500 shadow-sm"
            }`}
          />
          <button
            type="submit"
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition flex items-center gap-1 text-sm font-bold"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">افزودن</span>
          </button>
        </form>

        {/* لیست خط‌کشی‌شده کارها */}
        <div className="relative z-10 space-y-3 min-h-[250px]">
          {currentTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              هیچ کاری برای این روز ثبت نشده است. اولین کار را اضافه کن!
            </div>
          ) : (
            currentTasks.map((task) => (
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
                  {/* دکمه چک‌باکس انجام کار */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </button>

                  {/* متن کار یا حالت ویرایش */}
                  {editingTaskId === task.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className={`w-full p-1.5 rounded-lg border text-sm outline-none ${
                          isDarkMode
                            ? "bg-slate-700 border-indigo-400"
                            : "bg-slate-50 border-indigo-500"
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditing(task.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => toggleTask(task.id)}
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

                {/* دکمه‌های عملیات (ویرایش و حذف) */}
                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(task)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition"
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