"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export function StudentActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 rounded hover:bg-background-light dark:hover:bg-background-dark">
        <MoreVertical className="w-4 h-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>View Profile</DropdownMenuItem>
        <DropdownMenuItem className="text-red-500">
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

