"use client";

import React from "react";
import {
  MessageSquare,
  CheckSquare,
  Clock,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Award,
  Users,
} from "lucide-react";

interface MainGridProps {
  isDarkMode: boolean;
  searchQuery: string;
}

export default function MainGrid({ isDarkMode, searchQuery }: MainGridProps) {
  const mainBoxes = [
    
    { id: "planning", title: "برنامه‌ریزی", icon: CheckSquare, desc: "مدیریت کارهای روزانه" },
    { id: "study-log", title: "مطالعه روزانه", icon: Clock, desc: "ثبت ساعت خواب، دروس و تست‌ها" },
    { id: "exams", title: "آزمون آنلاین", icon: HelpCircle, desc: "شرکت در آزمون‌های آزمایشی" },
    { id: "leaderboard", title: "نفرات برتر", icon: Award, desc: "رتبه‌بندی بر اساس ساعت مطالعه" },
    { id: "percentage", title: "درصدگیری", icon: GraduationCap, desc: "محاسبه درصد آزمون‌ها" },
    { id: "resources", title: "منابع و کنکورها", icon: BookOpen, desc: "کنکورهای اخیر و امتحانات نهایی" },    
    { id: "group-study", title: "مطالعه گروهی", icon: Users, desc: "مطالعه هم‌زمان با دوستان" },
    { id: "consulting", title: "مشاوره آنلاین", icon: MessageSquare, desc: "ارتباط با مشاورین تحصیلی" }
  ];

  const filteredBoxes = mainBoxes.filter(
    (box) => box.title.includes(searchQuery) || box.desc.includes(searchQuery)
  );

  return (
    <main className="flex-1" dir="rtl">
      

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBoxes.map((box) => {
          const Icon = box.icon;
          return (
            <div
              key={box.id}
              data-id={box.id}
              className={`group p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50"
                  : "bg-white border-slate-200/80 hover:border-indigo-300"
              }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      فعال
                    </span>
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
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
    </main>
  );
}