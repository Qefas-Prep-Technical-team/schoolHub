"use client";

import { Button } from "@/components/ui/button";
import AddIcon from "@mui/icons-material/Add";

export default function PageHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground text-base">
          Search, filter, and manage student profiles.
        </p>
      </div>

      <Button 
        onClick={onAdd}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
      >
        <AddIcon fontSize="small" />
        Add New Student
      </Button>
    </div>
  );
}
