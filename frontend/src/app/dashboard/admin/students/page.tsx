"use client";
import { useState } from "react";
import PageHeader from "./components/PageHeader";
import SearchBar from "./components/SearchBar";
import FilterChips from "./components/FilterChips";
import AddStudentDialog from "./components/AddStudentDialog";
import StudentsTable from "./components/StudentsTable";


export default function StudentsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <PageHeader onAdd={() => setOpen(true)} />

      <SearchBar />

      <FilterChips />

      <StudentsTable/>

      <AddStudentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
