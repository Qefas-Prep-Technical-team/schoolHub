'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, LayoutGrid, List, PlusCircle, Search, Info } from 'lucide-react';
import { useClassSubjectResults } from '@/lib/api/hooks/useRecords';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function FinalResultsTab({ classId }: { classId: string }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const PAGE_SIZE = 10;

  const { data: subjectResults, isLoading } = useClassSubjectResults();

  const filteredResults = useMemo(() => {
    if (!subjectResults) return [];
    return subjectResults.filter((res: any) => 
      res.classId === classId && 
      (res.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       res.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [subjectResults, classId, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const paginated = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-gray-900 dark:text-white text-xl font-bold">Final Results</h2>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="text-slate-400 hover:text-primary transition-colors">
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                  Displays the cumulative final grades and end-of-term evaluations for this class. Use this view to audit student progress and prepare official report cards or transcripts at the end of the academic period.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} configured
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/admin/records')}
            className="flex items-center gap-2 rounded-full h-10 px-5 bg-primary text-white dark:text-gray-900 text-sm font-semibold shadow-sm hover:bg-primary/90 transition-opacity"
          >
            <PlusCircle size={16} />
            Configure New
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-y-3 gap-x-6 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by subject or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[300px]">
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3.5 w-12">#</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Session / Term</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-slate-800/50">
                      <td className="px-6 py-4"><div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1.5"></div>
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg ml-auto"></div></td>
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                          <FileCheck className="text-slate-400" size={24} />
                        </div>
                        <p className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-1">No final results found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((res: any, index: number) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + index + 1;
                    return (
                    <tr key={res.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-slate-400/70 select-none">#{globalIdx}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{res.name}</td>
                      <td className="px-6 py-4">
                        <span className="block text-slate-900 dark:text-slate-100">{res.session?.name}</span>
                        <span className="text-xs text-slate-400">{res.term}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{res.subject?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          res.status === "PUBLISHED" 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => router.push('/dashboard/admin/records/new?id=' + res.id)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary rounded-lg text-xs font-semibold transition-all"
                        >
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
               Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 animate-pulse">
                   <div className="flex justify-between items-start">
                     <div className="space-y-2">
                       <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                       <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                     </div>
                     <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                     <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                     <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
                   </div>
                   <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded-lg mt-1"></div>
                 </div>
               ))
            ) : paginated.length === 0 ? (
               <div className="col-span-full py-8 text-center text-slate-500">No results found.</div>
            ) : (
              paginated.map((res: any, index: number) => {
                const globalIdx = (page - 1) * PAGE_SIZE + index + 1;
                return (
                <div key={res.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-bold text-slate-900 dark:text-white truncate" title={res.name}>
                         <span className="text-slate-400 mr-1.5 select-none text-xs">#{globalIdx}</span>
                         {res.name}
                       </h3>
                       <p className="text-xs text-slate-500 truncate mt-0.5">{res.session?.name} • {res.term}</p>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${res.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                       {res.status}
                     </span>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                     <p className="text-slate-400 mb-0.5 text-[10px] uppercase">Subject</p>
                     <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">{res.subject?.name}</p>
                   </div>
                   <button 
                     onClick={() => router.push('/dashboard/admin/records/new?id=' + res.id)} 
                     className="w-full text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 py-2 rounded-lg transition-colors"
                   >
                     View Details
                   </button>
                </div>
              )})
            )}
          </div>
        )}
      </div>
    </div>
  );
}
