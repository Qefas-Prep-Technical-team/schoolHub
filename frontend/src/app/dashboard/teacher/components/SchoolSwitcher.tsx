"use client"

import * as React from "react"
import { School, User, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
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
  userImage?: string
  userName?: string
}

export function SchoolSwitcher({ schools, selectedId, onSelect, userId, userImage, userName }: SchoolSwitcherProps) {
  const [open, setOpen] = React.useState(false)




  const selectedSchool = React.useMemo(() => {
    if (!selectedId || selectedId === userId)
      return { name: "Personal Dashboard", id: userId, type: 'personal' as const }
    const school = schools.find((s) => s.id === selectedId)
    return school
      ? { ...school, type: 'school' as const }
      : { name: "Personal Dashboard", id: userId, type: 'personal' as const }
  }, [schools, selectedId, userId])

  const isPersonal = selectedSchool.type === 'personal'

  // Avatar for currently selected option
  const selectedImage = isPersonal
    ? userImage
    : selectedSchool.logo || selectedSchool.image || undefined
  const selectedInitial = isPersonal
    ? (userName?.charAt(0) ?? 'T')
    : (selectedSchool.name?.charAt(0) ?? 'S')

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-xl cursor-pointer",
            "transition-all duration-200 active:scale-[0.98]",
            "border shadow-sm",
            isPersonal
              ? "bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700/80"
              : "bg-emerald-500/8 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/25 hover:bg-emerald-500/12 dark:hover:bg-emerald-500/15",
            open && (isPersonal
              ? "ring-2 ring-slate-300 dark:ring-slate-600"
              : "ring-2 ring-emerald-500/30 dark:ring-emerald-500/30")
          )}
        >
          {/* Avatar */}
          <div className={cn(
            "relative h-7 w-7 rounded-lg shrink-0 overflow-hidden ring-2",
            isPersonal ? "ring-slate-200 dark:ring-slate-700" : "ring-emerald-400/30 dark:ring-emerald-500/30"
          )}>
            {selectedImage ? (
              <img src={selectedImage} alt={selectedSchool.name} className="h-full w-full object-cover" />
            ) : (
              <div className={cn(
                "h-full w-full flex items-center justify-center text-white text-[11px] font-black",
                isPersonal
                  ? "bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600"
              )}>
                {selectedInitial}
              </div>
            )}
          </div>

          {/* Label */}
          <div className="flex flex-col leading-none min-w-0 text-left">
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest leading-none",
              isPersonal ? "text-slate-400 dark:text-slate-500" : "text-emerald-500 dark:text-emerald-400"
            )}>
              {isPersonal ? "Personal" : "My School"}
            </span>
            <span className="text-[12px] font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[150px] mt-0.5 leading-tight">
              {selectedSchool.name}
            </span>
          </div>

          {/* Live dot (school) or chevron (always) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isPersonal && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            )}
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-slate-400 transition-transform duration-300",
              open ? "rotate-180 text-emerald-500" : "group-hover:text-emerald-500"
            )} />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[250px] p-2 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
          Switch Workspace
        </DropdownMenuLabel>

        {/* Personal option */}
        <DropdownMenuItem
          onClick={() => { onSelect(userId, "Personal Dashboard"); setOpen(false) }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 focus:outline-none",
            selectedId === userId
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
          )}
        >
          {/* Personal avatar */}
          <div className="relative h-9 w-9 rounded-xl overflow-hidden shrink-0 ring-2 ring-slate-200 dark:ring-slate-700">
            {userImage ? (
              <img src={userImage} alt={userName ?? 'Me'} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 text-white text-sm font-black">
                {userName?.charAt(0) ?? <User className="h-4 w-4" />}
              </div>
            )}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[12px] font-black text-slate-900 dark:text-white leading-tight">Personal Dashboard</span>
            <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">No school context</span>
          </div>
          {selectedId === userId && (
            <div className="shrink-0 h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
        </DropdownMenuItem>

        {/* School options */}
        {schools.length > 0 && (
          <>
            <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuLabel className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">
              Connected Schools
            </DropdownMenuLabel>
            <div className="space-y-0.5">
              {schools.map((school) => (
                <DropdownMenuItem
                  key={school.id}
                  onClick={() => { onSelect(school.id, school.name); setOpen(false) }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 focus:outline-none",
                    selectedId === school.id
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  )}
                >
                  {/* School avatar / logo */}
                  <div className={cn(
                    "relative h-9 w-9 rounded-xl overflow-hidden shrink-0 ring-2",
                    selectedId === school.id
                      ? "ring-emerald-400/40 dark:ring-emerald-500/30"
                      : "ring-blue-200/50 dark:ring-blue-800/30"
                  )}>
                    {(school.logo || school.image) ? (
                      <img src={school.logo || school.image} alt={school.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className={cn(
                        "h-full w-full flex items-center justify-center text-white text-sm font-black",
                        selectedId === school.id
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600"
                      )}>
                        {school.name?.charAt(0) ?? <School className="h-4 w-4" />}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[12px] font-black text-slate-900 dark:text-white leading-tight truncate">{school.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">School context</span>
                  </div>
                  {selectedId === school.id && (
                    <div className="shrink-0 h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </>
        )}

        {schools.length === 0 && (
          <>
            <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />
            <div className="px-3 py-4 text-center">
              <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2">
                <School className="h-4 w-4 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">No schools linked yet</p>
              <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">Connect via the Linking Hub</p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
