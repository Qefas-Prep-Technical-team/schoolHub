"use client";

import { Input } from "@/components/ui/input";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 rounded-lg h-12 border bg-card px-3">
        <SearchIcon className="text-muted-foreground" />
        <Input 
          placeholder="Search by name, class, or ID..."
          className="border-0 focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
