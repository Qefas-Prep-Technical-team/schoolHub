"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "./components/PageHeader";
import SearchBar from "./components/SearchBar";
import FilterChips from "./components/FilterChips";
import AddStudentDialog from "./components/AddStudentDialog";
import StudentsTable from "./components/StudentsTable";


export default function StudentsPage() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    if (searchParams.get('showAdd') === 'true') {
      setOpen(true);
    }
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    classId: "",
    gender: "",
    status: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search change
  };

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      <PageHeader onAdd={() => setOpen(true)} />

      <div className="space-y-4">
        <SearchBar value={searchTerm} onChange={handleSearchChange} />
        <FilterChips selectedFilters={filters} onFilterChange={handleFilterChange} />
      </div>

      <StudentsTable 
        searchTerm={searchTerm} 
        filters={filters} 
        page={page}
        onPageChange={setPage}
      />

      <AddStudentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
