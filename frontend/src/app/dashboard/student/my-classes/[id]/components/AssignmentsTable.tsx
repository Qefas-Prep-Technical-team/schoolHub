'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Download, Filter, Search, ChevronLeft, ChevronRight, Edit, UserPlus, Users, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  status: 'graded' | 'submitted' | 'upcoming' | 'overdue';
  grade?: string;
  maxPoints?: number;
  type?: string;
  link?: string;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
  hasDepartment: boolean;
  pageSize?: number;
}

export default function AssignmentsTable({
  assignments,
  hasDepartment,
  pageSize = 10,
}: AssignmentsTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = assignments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  return (
    <Card className="border-none shadow-sm rounded-[1.5rem] bg-white dark:bg-slate-900 overflow-hidden">
      <CardContent className="p-0">
        
        {/* Top Header / Filters (Owlee Style) */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assessments</h2>
              <p className="text-sm font-medium text-slate-400">Total: {filtered.length}</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input 
                  placeholder="Search assessments..." 
                  className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="hidden sm:flex h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 gap-2">
                <Download size={14} /> Export data
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
             <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 outline-none">
                <option>Type</option>
             </select>
             <select className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 outline-none">
                <option>Status</option>
             </select>
             <Button variant="ghost" className="h-9 text-slate-500 gap-2">
                <Filter size={14} /> All filters
             </Button>
          </div>
        </div>

        {/* Table */}
        {filtered.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded text-pink-600 w-4 h-4" /></th>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Assessment</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Grade</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {paginated.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-slate-300 text-pink-600 focus:ring-pink-500 w-4 h-4 transition-all" />
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-medium">#{assignment.id.toString().padStart(3, '0')}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                        {assignment.title}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                        {assignment.type || 'Assessment'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                        {assignment.dueDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`capitalize text-xs font-bold px-2.5 py-1 rounded-md ${
                          assignment.status === 'graded' ? 'bg-emerald-50 text-emerald-600' :
                          assignment.status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
                          assignment.status === 'submitted' ? 'bg-purple-50 text-purple-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 text-center">
                        {assignment.grade || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end">
                           {assignment.link && assignment.link !== '#' ? (
                             <Link href={assignment.link}>
                               <Button variant="outline" size="sm" className="h-8 text-pink-600 border-pink-200 hover:bg-pink-50 hover:text-pink-700 rounded-lg font-bold text-xs">
                                 Preview
                               </Button>
                             </Link>
                           ) : (
                             <Button variant="outline" size="sm" className="h-8 text-slate-400 border-slate-200 rounded-lg font-bold text-xs" disabled>
                               Preview
                             </Button>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500 font-medium">
                {startIdx + 1} to {Math.min(startIdx + pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="h-8 px-2 text-slate-400">
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-xs font-bold text-slate-700 px-2">Page {safePage} of {totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="h-8 px-2 text-slate-400">
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 px-6">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-800 dark:text-white font-bold text-lg mb-2">No Assessments Found</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              There are no assessments matching your current search or filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}