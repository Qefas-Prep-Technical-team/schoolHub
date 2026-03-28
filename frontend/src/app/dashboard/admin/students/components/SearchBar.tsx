"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="w-full relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
        <Search size={20} />
      </div>
      <Input 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search students by name, email or code..."
        className="w-full h-14 pl-12 pr-6 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
      />
    </div>
  );
}
