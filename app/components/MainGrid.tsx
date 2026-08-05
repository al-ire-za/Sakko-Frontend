"use client";

import React, { useEffect, useState } from "react";
import Leaderboard from "./Leaderboard";
import PercentageCalculator from "./PercentageCalculator";
import OnlineConsultation from "./OnlineConsultation";
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
  ArrowRight,
  UserCheck,
  ClipboardList,
  LucideIcon,
} from "lucide-react";

interface MainGridProps {
  isDarkMode: boolean;
  searchQuery: string;
}

const iconMap: Record<string, LucideIcon> = {
  BookOpen: BookOpen,
  Video: Video,
  FileText: FileText,
  Award: Award,
  Zap: Zap,
  GraduationCap: GraduationCap,
};

// ساختار آیتم‌های باکس
interface BoxItem {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  darkColor: string;
  lightColor: string;
  isCourse?: boolean;
  roleRequired?: "consultant" | "student"; // اگر تعریف نشود، برای هر دو نقش نمایش داده می‌شود
}

// باکس‌های ثابت سیستم
const staticBoxes: BoxItem[] = [
  // --- باکس‌های مخصوص دانش‌آموز ---
  { id: "planning", title: "برنامه‌ریزی", icon: CheckSquare, darkColor: "text-white", lightColor: "text-black", desc: "مدیریت کارهای روزانه", roleRequired: "student" },
  { id: "study-log", title: "مطالعه روزانه", icon: Clock, darkColor: "text-yellow-400", lightColor: "text-yellow-400", desc: "ثبت ساعت خواب، دروس و تست‌ها", roleRequired: "student" },
  { id: "exams", title: "آزمون آنلاین", icon: HelpCircle, darkColor: "text-green-300", lightColor: "text-green-300", desc: "شرکت در آزمون‌های آزمایشی", roleRequired: "student" },
  { id: "percentage", title: "درصدگیری", icon: GraduationCap, darkColor: "text-cyan-400", lightColor: "text-cyan-400", desc: "محاسبه درصد آزمون‌ها", roleRequired: "student" },
  { id: "resources", title: "منابع و کنکورها", icon: BookOpen, darkColor: "text-sky-600", lightColor: "text-sky-600", desc: "کنکورهای اخیر و امتحانات نهایی", roleRequired: "student" },
  { id: "group-study", title: "مطالعه گروهی", icon: Users, darkColor: "text-violet-600", lightColor: "text-violet-600", desc: "مطالعه هم‌زمان با دوستان", roleRequired: "student" },
  { id: "consulting", title: "مشاوره آنلاین", icon: MessageSquare, darkColor: "text-fuchsia-500", lightColor: "text-fuchsia-500", desc: "ارتباط با مشاورین تحصیلی", roleRequired: "student" },

  // --- باکس‌های عمومی (نمایش برای هم دانش‌آموز و هم مشاور) ---
  { id: "leaderboard", title: "نفرات برتر", icon: Award, darkColor: "text-teal-500", lightColor: "text-teal-500", desc: "رتبه‌بندی بر اساس ساعت مطالعه" },


  // --- باکس‌های ویژه نقش مشاور ---
  { id: "students-list", title: "مدیریت دانش‌آموزان", icon: UserCheck, darkColor: "text-emerald-400", lightColor: "text-emerald-600", desc: "مشاهده گزارش و وضعیت شاگردان", roleRequired: "consultant" },
  { id: "consultant-tasks", title: "ارسال برنامه به شاگردان", icon: ClipboardList, darkColor: "text-purple-400", lightColor: "text-purple-600", desc: "تنظیم و ارسال برنامه‌های هفتگی", roleRequired: "consultant" },
];

export default function MainGrid({ isDarkMode, searchQuery }: MainGridProps) {
  const [allBoxes, setAllBoxes] = useState<BoxItem[]>(staticBoxes);
  const [isLoading, setIsLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("student");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // ۱. دریافت توکن و اطلاعات کاربر از localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.is_consultant || parsedUser.role === "consultant") {
          setUserRole("consultant");
        } else {
          setUserRole("student");
        }
      } catch (e) {
        console.error("خطا در بازخوانی اطلاعات کاربر:", e);
      }
    }

    // ۲. دریافت دوره‌ها از API
    fetch(`${API_BASE_URL}/api/courses/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("خطا در دریافت دوره‌ها:", err);
        setIsLoading(false);
      });
  }, [API_BASE_URL]);

  // ✅ اصلاح شد: فیلتر روی allBoxes (ترکیب باکس‌های ثابت + دوره‌های API)
  const filteredBoxes = allBoxes.filter((box) => {
    const matchesSearch =
      box.title.includes(searchQuery) || box.desc.includes(searchQuery);

    if (!matchesSearch) return false;

    // اگر باکسی نیاز به نقش خاصی ندارد (عمومی است)، برای همه نشان داده شود
    if (!box.roleRequired) return true;

    // اگر نقش کاربر با نقش required باکس یکی است، نشان داده شود
    return box.roleRequired === userRole;
  });

  const handleBoxClick = (boxId: string) => {
    if (boxId === "leaderboard") {
      setActiveComponent("leaderboard");
    } else if (boxId === "percentage") {
      setActiveComponent("percentage");
    } else if (boxId === "consulting") {
      setActiveComponent("consulting");
    } else {
      console.log(`باکس ${boxId} انتخاب شد.`);
    }
  };

  if (activeComponent === "leaderboard") {
    return (
      <div className="space-y-4" dir="rtl">
        <button
          onClick={() => setActiveComponent(null)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition mb-4"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست اصلی
        </button>
        <Leaderboard isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (activeComponent === "percentage") {
    return (
      <div className="space-y-4" dir="rtl">
        <button
          onClick={() => setActiveComponent(null)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition mb-4"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست اصلی
        </button>
        <PercentageCalculator isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (activeComponent === "consulting") {
    return (
      <div className="space-y-4" dir="rtl">
        <OnlineConsultation isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <main className="flex-1" dir="rtl">
      {isLoading ? (
        <div className="text-center py-10 text-xs text-slate-400">
          در حال دریافت اطلاعات از سرور...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <div
                key={box.id}
                data-id={box.id}
                onClick={() => handleBoxClick(box.id)}
                className={`group p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                  isDarkMode
                    ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-black/10"
                    : "bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-black/20"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {box.roleRequired === "consultant" ? "پنل مشاور" : "فعال"}
                  </span>
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors">
                    <Icon className={`w-6 h-6 ${isDarkMode ? box.darkColor : box.lightColor}`} />
                  </div>
                </div>
                <h3 className="font-bold font-bnaz text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-right">
                  {box.title}
                </h3>
                <p className="text-xs font-bnaz text-slate-500 dark:text-slate-400 leading-relaxed text-right">
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