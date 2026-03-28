"use client";
import { useState } from "react";
import PageHeader from "./components/PageHeader";
import SearchBar from "./components/SearchBar";
import FilterChips from "./components/FilterChips";
import AddStudentDialog from "./components/AddStudentDialog";
import StudentsTable from "./components/StudentsTable";


export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    classId: "",
    gender: "",
    status: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <PageHeader onAdd={() => setOpen(true)} />

      <div className="space-y-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <FilterChips selectedFilters={filters} onFilterChange={handleFilterChange} />
      </div>

      <StudentsTable searchTerm={searchTerm} filters={filters} />

      <AddStudentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
