"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function FilterChips() {
  const items = ["Class", "Gender", "Status"];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((label) => (
        <DropdownMenu key={label}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-9"
            >
              {label}
              <ExpandMoreIcon fontSize="small" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem>All</DropdownMenuItem>
            <DropdownMenuItem>Option 1</DropdownMenuItem>
            <DropdownMenuItem>Option 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  );
}
