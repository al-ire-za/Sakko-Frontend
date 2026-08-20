"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  CheckSquare,
  Clock,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Award,
  Users,
  Video,
  FileText,
  Zap,
  UserCheck,
  ClipboardList,
  LucideIcon,
  Loader2,
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders, getSavedUser } from "../utils/api";

interface MainGridProps {
  isDarkMode: boolean;
  searchQuery: string;
  onSelectTab: (tabId: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  BookOpen: BookOpen,
  Video: Video,
  FileText: FileText,
  Award: Award,
  Zap: Zap,
  GraduationCap: GraduationCap,
  Clock: Clock,
  CheckSquare: CheckSquare,
  MessageSquare: MessageSquare,
  HelpCircle: HelpCircle,
  Users: Users,
};

// ساختار آیتم‌های باکس
export interface BoxItem {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  darkColor: string;
  lightColor: string;
  isCourse?: boolean;
  roleRequired?: "consultant" | "student";
}

// باکس‌های ثابت سیستم
const staticBoxes: BoxItem[] = [
  // --- باکس‌های مخصوص دانش‌آموز ---
  {
    id: "planning",
    title: "برنامه‌ریزی روزانه",
    icon: CheckSquare,
    darkColor: "text-indigo-400",
    lightColor: "text-indigo-600",
    desc: "مدیریت کارهای روزانه و شمارش معکوس کنکور",
    roleRequired: "student",
  },
  {
    id: "study-log",
    title: "مطالعه و خواب روزانه",
    icon: Clock,
    darkColor: "text-amber-400",
    lightColor: "text-amber-500",
    desc: "ثبت ساعات مطالعه، تست‌ها و الگوی خواب",
    roleRequired: "student",
  },
  {
    id: "percentage",
    title: "درصدگیری آزمون",
    icon: GraduationCap,
    darkColor: "text-cyan-400",
    lightColor: "text-cyan-500",
    desc: "محاسبه درصد با نمره منفی و تحلیل تراز",
    roleRequired: "student",
  },
  {
    id: "consulting",
    title: "مشاوره و ارسال تکالیف",
    icon: MessageSquare,
    darkColor: "text-fuchsia-400",
    lightColor: "text-fuchsia-600",
    desc: "انتخاب مشاور، ارسال تمرین و دریافت برنامه",
    roleRequired: "student",
  },

  // --- باکس‌های عمومی ---
  {
    id: "leaderboard",
    title: "نفرات برتر مطالعه",
    icon: Award,
    darkColor: "text-teal-400",
    lightColor: "text-teal-600",
    desc: "رتبه‌بندی کاربران بر اساس ساعت مطالعه و تعداد تست",
  },

  // --- باکس‌های ویژه نقش مشاور ---
  {
    id: "students-list",
    title: "مدیریت شاگردان",
    icon: UserCheck,
    darkColor: "text-emerald-400",
    lightColor: "text-emerald-600",
    desc: "مشاهده گزارش و دانلود تکالیف ارسالی شاگردان",
    roleRequired: "consultant",
  },
  {
    id: "send-program",
    title: "ارسال برنامه به شاگردان",
    icon: ClipboardList,
    darkColor: "text-purple-400",
    lightColor: "text-purple-600",
    desc: "تنظیم و پیوست فایل برنامه هفتگی برای دانش‌آموزان",
    roleRequired: "consultant",
  },
];

export default function MainGrid({
  isDarkMode,
  searchQuery,
  onSelectTab,
}: MainGridProps) {
  const [allBoxes, setAllBoxes] = useState<BoxItem[]>(staticBoxes);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("student");

  useEffect(() => {
    const user = getSavedUser();
    if (user) {
      if (user.is_consultant || user.role === "consultant") {
        setUserRole("consultant");
      } else {
        setUserRole("student");
      }
    }

    // دریافت دوره‌ها از API
    fetch(`${API_BASE_URL}/api/courses/`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`خطای شبکه: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const coursesArray = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        const courseBoxes: BoxItem[] = coursesArray.map((course: any) => ({
          id: `course-${course.id}`,
          title: course.title,
          desc: course.description || `مدرس: ${course.instructor || "نامشخص"}`,
          icon: iconMap[course.icon_name] || BookOpen,
          darkColor: course.dark_color || "text-indigo-400",
          lightColor: course.light_color || "text-indigo-600",
          isCourse: true,
        }));

        setAllBoxes([...staticBoxes, ...courseBoxes]);
      })
      .catch((err) => {
        console.error("خطا در دریافت دوره‌ها:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredBoxes = allBoxes.filter((box) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      box.title.toLowerCase().includes(q) ||
      box.desc.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (!box.roleRequired) return true;
    return box.roleRequired === userRole;
  });

  return (
    <main className="flex-1" dir="rtl">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-xs">در حال بارگذاری بخش‌های سامانه...</span>
        </div>
      ) : filteredBoxes.length === 0 ? (
        <div className="text-center py-16 text-xs text-slate-400">
          موردی متناسب با جستجوی شما یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <div
                key={box.id}
                data-id={box.id}
                onClick={() => onSelectTab(box.id)}
                className={`group p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60"
                    : "bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {box.roleRequired === "consultant"
                      ? "پنل مشاور"
                      : box.isCourse
                      ? "دوره آموزشی"
                      : "بخش فعال"}
                  </span>
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <Icon
                      className={`w-6 h-6 ${
                        isDarkMode ? box.darkColor : box.lightColor
                      }`}
                    />
                  </div>
                </div>
                <h3 className="font-bold text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-right">
                  {box.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-right">
                  {box.desc}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}