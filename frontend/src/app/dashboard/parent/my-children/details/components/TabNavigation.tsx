"use client";

import {
  Tab,
} from "@headlessui/react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Calendar,
  Brain,
  Folder,
} from "lucide-react";
import OverviewTab from "./OverviewTab";
import AcademicsPage from "./academics/page";
import AssignmentsPage from "./assignments/page";
import ExamsPage from "./exams&Quizzes/page";
import AttendancePage from "./attendance/page";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "academics", label: "Academics", icon: BookOpen },
  { id: "assignments", label: "Assignments", icon: FileText },
  { id: "exams", label: "Exams & Quizzes", icon: HelpCircle },
  { id: "attendance", label: "Attendance", icon: Calendar },
  // { id: "behaviour", label: "Behaviour", icon: Brain },
  // { id: "documents", label: "Documents", icon: Folder },
];

export default function TabNavigation() {
  return (
    <Tab.Group>
      {/* TOP TAB NAV */}
      <div className="w-full overflow-x-auto hide-scrollbar mb-6 border-b border-slate-200 dark:border-slate-800">
        <Tab.List className="flex space-x-8 min-w-max px-1">
          {tabs.map((tab) => (
            <Tab key={tab.id} className="focus:outline-none cursor-pointer">
              {({ selected }) => {
                const Icon = tab.icon;

                return (
                  <button
                    className={`group flex items-center cursor-pointer gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-all ${
                      selected
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Icon
                      className={`size-5 ${
                        !selected &&
                        "group-hover:scale-110 transition-transform"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              }}
            </Tab>
          ))}
        </Tab.List>
      </div>

      {/* TAB PANELS */}
      <Tab.Panels>
        <Tab.Panel>
         <OverviewTab/>
        </Tab.Panel>

        <Tab.Panel>
          <AcademicsPage/>
        </Tab.Panel>

        <Tab.Panel>
          <AssignmentsPage/>
        </Tab.Panel>

        <Tab.Panel>
          <ExamsPage/>
        </Tab.Panel>

        <Tab.Panel>
          <AttendancePage/>
        </Tab.Panel>

        <Tab.Panel>
          <div className="p-4">Behaviour content...</div>
        </Tab.Panel>

        <Tab.Panel>
          <div className="p-4">Documents content...</div>
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
