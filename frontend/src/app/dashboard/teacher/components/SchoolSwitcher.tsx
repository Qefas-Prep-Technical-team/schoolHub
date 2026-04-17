"use client"

import * as React from "react"
import { Check, ChevronsUpDown, School, User, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface SchoolSwitcherProps {
  schools: any[]
  selectedId: string
  onSelect: (id: string, name: string) => void
  userId: string
}

export function SchoolSwitcher({ schools, selectedId, onSelect, userId }: SchoolSwitcherProps) {
  const [open, setOpen] = React.useState(false)

  const selectedSchool = React.useMemo(() => {
    if (!selectedId || selectedId === userId) return { name: "Personal Dashboard", id: userId, type: 'personal' }
    const school = schools.find((s) => s.id === selectedId)
    return school ? { ...school, type: 'school' } : { name: "Personal Dashboard", id: userId, type: 'personal' }
  }, [schools, selectedId, userId])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className={cn(
            "flex items-center gap-2 px-3 h-11 transition-all duration-300 rounded-xl",
            "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
            "border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
            "w-[200px] justify-between shadow-sm active:scale-[0.98]",
            open && "ring-2 ring-primary/20 bg-white dark:bg-slate-900 border-primary/30"
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className={cn(
              "flex items-center justify-center h-6 w-6 rounded-md shrink-0 transition-colors",
              selectedSchool.type === 'personal' 
                ? "bg-primary/20 text-primary" 
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            )}>
              {selectedSchool.type === 'personal' ? (
                <User className="h-4 w-4" />
              ) : (
                <School className="h-4 w-4" />
              )}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100 leading-none truncate w-full">
                {selectedSchool.name}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none mt-1">
                {selectedSchool.type === 'personal' ? 'Personal' : 'School Context'}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[240px] p-2 rounded-xl shadow-2xl border-slate-200 dark:border-slate-800 animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Workspaces
        </DropdownMenuLabel>
        
        <DropdownMenuItem
          onClick={() => onSelect(userId, "Personal Dashboard")}
          className={cn(
            "flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors",
            selectedId === userId ? "bg-primary/10 text-primary" : "hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/20 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-bold">Personal Dashboard</span>
            <span className="text-[10px] opacity-70">General Overview</span>
          </div>
          {selectedId === userId && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-2 bg-slate-100 dark:bg-slate-800" />
        
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
          Connected Schools
        </DropdownMenuLabel>
        
        <div className="space-y-1">
          {schools.length === 0 ? (
            <div className="px-2 py-8 text-center">
              < Globe className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-[11px] text-slate-400">No schools linked yet</p>
            </div>
          ) : (
            schools.map((school) => (
              <DropdownMenuItem
                key={school.id}
                onClick={() => onSelect(school.id, school.name)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors",
                  selectedId === school.id ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-300">
                  <School className="h-4 w-4" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-bold">{school.name}</span>
                  <span className="text-[10px] opacity-70">School Context</span>
                </div>
                {selectedId === school.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
