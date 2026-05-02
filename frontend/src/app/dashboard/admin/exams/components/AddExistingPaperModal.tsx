'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Link as LinkIcon, FileText } from 'lucide-react';
import { useSubjectPapers, useLinkPaperToExam } from '@/lib/api/hooks/useExams';

interface AddExistingPaperModalProps {
  examId: string;
  trigger?: React.ReactNode;
}

export default function AddExistingPaperModal({ examId, trigger }: AddExistingPaperModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const { data: papers = [], isLoading } = useSubjectPapers({ unlinkedOnly: false });
  const linkMutation = useLinkPaperToExam();

  const filteredPapers = papers.filter(p => 
    (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    !p.exams?.some(link => link.examId === examId)
  );

  const handleLink = async (paperId: string) => {
    await linkMutation.mutateAsync({ paperId, examId });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Add Existing Paper
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Existing Subject Paper</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by title or subject..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto mt-6 space-y-3 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-slate-500 mt-2">Loading your papers...</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm italic">No unlinked papers found matching your search.</p>
            </div>
          ) : (
            filteredPapers.map((paper) => (
              <div 
                key={paper.id} 
                className="flex items-center justify-between p-4 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white truncate max-w-[250px]">
                    {paper.title || `${paper.subject?.name || 'Untitled'} Paper`}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {paper.subject?.name || 'No Subject'} • {paper.durationMinutes} mins • {paper._count?.questions || 0} questions
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleLink(paper.id)}
                  disabled={linkMutation.isPending}
                  className="gap-1 min-w-[80px]"
                >
                  {linkMutation.isPending && (linkMutation.variables as any)?.paperId === paper.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <LinkIcon className="h-3 w-3" />
                  )}
                  Link
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

