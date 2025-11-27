"use client";

import { useState } from "react";
import { students as initialStudents, Student } from "./students-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface StatusChipProps {
  status: "Active" | "Inactive";
}

const StatusChip = ({ status }: StatusChipProps) => {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isActive ? "bg-green-600" : "bg-red-600"
        }`}
      />
      {status}
    </span>
  );
};

export default function StudentsTable() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectAll, setSelectAll] = useState(false);

  const toggleSelect = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const toggleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setStudents((prev) => prev.map((s) => ({ ...s, selected: newValue })));
  };

  return (
    <div className="overflow-x-auto bg-surface-light dark:bg-surface-dark rounded-lg border border-border-light dark:border-border-dark">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-background-light dark:bg-background-dark">
          <tr>
            <th className="p-4">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded focus:ring-primary"
                checked={selectAll}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-6 py-3">Student Name</th>
            <th className="px-6 py-3">Student ID</th>
            <th className="px-6 py-3">Class</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark"
            >
              <td className="p-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                  checked={student.selected}
                  onChange={() => toggleSelect(student.id)}
                />
              </td>
              <td className="px-6 py-4 font-medium whitespace-nowrap">
                <Link href={"/dashboard/admin/students/profilePage"} className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-xs text-text-light/60 dark:text-text-dark/60">
                      {student.email}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4">{student.studentId}</td>
              <td className="px-6 py-4">{student.className}</td>
              <td className="px-6 py-4">
                <StatusChip status={student.status} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <span className="material-symbols-outlined !text-xl">
                      visibility
                    </span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <span className="material-symbols-outlined !text-xl">
                      edit
                    </span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <span className="material-symbols-outlined !text-xl">
                      more_vert
                    </span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
