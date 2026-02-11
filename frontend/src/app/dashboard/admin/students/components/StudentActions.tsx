"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export function StudentActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2 rounded hover:bg-background-light dark:hover:bg-background-dark">
        <MoreVertIcon fontSize="small" />
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
