"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface FilterChipsProps {
  selectedFilters: {
    classId: string;
    gender: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function FilterChips({ selectedFilters, onFilterChange }: FilterChipsProps) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId;

  const { data: classes = [] } = useQuery({
    queryKey: ["school-classes", schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${schoolId}`);
      return data.data || [];
    },
    enabled: !!schoolId,
  });

  const genderOptions = ["MALE", "FEMALE", "OTHER"];
  const statusOptions = ["Verified", "Pending"];

  const hasFilters = Object.values(selectedFilters).some(v => v !== "");

  const clearFilters = () => {
    onFilterChange("classId", "");
    onFilterChange("gender", "");
    onFilterChange("status", "");
  };

  const selectedClass = classes.find((c: any) => c.id === selectedFilters.classId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
        <Filter size={18} />
      </div>

      {/* Class Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={selectedFilters.classId ? "default" : "outline"}
            className={`h-11 rounded-2xl px-5 flex items-center gap-2 font-bold text-xs transition-all ${
              selectedFilters.classId ? "bg-primary shadow-lg shadow-primary/20" : "border-slate-200"
            }`}
          >
            {selectedClass ? `${selectedClass.name} ${selectedClass.section || ""}` : "All Classes"}
            <ChevronDown size={14} className={selectedFilters.classId ? "text-white/70" : "text-slate-400"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400 py-2 px-3">Filter by Class</DropdownMenuLabel>
          <DropdownMenuItem 
             onClick={() => onFilterChange("classId", "")}
             className="rounded-xl font-bold text-xs py-2.5"
          >
            All Classes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {classes.map((c: any) => (
            <DropdownMenuItem 
              key={c.id} 
              onClick={() => onFilterChange("classId", c.id)}
              className="rounded-xl font-bold text-xs py-2.5"
            >
              {c.name} {c.section}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Gender Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={selectedFilters.gender ? "default" : "outline"}
            className={`h-11 rounded-2xl px-5 flex items-center gap-2 font-bold text-xs transition-all ${
              selectedFilters.gender ? "bg-primary shadow-lg shadow-primary/20" : "border-slate-200"
            }`}
          >
            {selectedFilters.gender || "All Genders"}
            <ChevronDown size={14} className={selectedFilters.gender ? "text-white/70" : "text-slate-400"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400 py-2 px-3">Filter by Gender</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onFilterChange("gender", "")} className="rounded-xl font-bold text-xs py-2.5">All Genders</DropdownMenuItem>
          <DropdownMenuSeparator />
          {genderOptions.map((opt) => (
            <DropdownMenuItem 
              key={opt} 
              onClick={() => onFilterChange("gender", opt)}
              className="rounded-xl font-bold text-xs py-2.5"
            >
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={selectedFilters.status ? "default" : "outline"}
            className={`h-11 rounded-2xl px-5 flex items-center gap-2 font-bold text-xs transition-all ${
              selectedFilters.status ? "bg-primary shadow-lg shadow-primary/20" : "border-slate-200"
            }`}
          >
            {selectedFilters.status || "All Status"}
            <ChevronDown size={14} className={selectedFilters.status ? "text-white/70" : "text-slate-400"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-black text-slate-400 py-2 px-3">Filter by Status</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onFilterChange("status", "")} className="rounded-xl font-bold text-xs py-2.5">All Status</DropdownMenuItem>
          <DropdownMenuSeparator />
          {statusOptions.map((opt) => (
            <DropdownMenuItem 
              key={opt} 
              onClick={() => onFilterChange("status", opt)}
              className="rounded-xl font-bold text-xs py-2.5"
            >
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-11 px-4 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 flex gap-2"
        >
          <X size={14} /> Clear All
        </Button>
      )}
    </div>
  );
}

