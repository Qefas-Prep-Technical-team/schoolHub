import React from 'react';
import { Sparkles, Plus, Download, Zap, Layers, ArrowDownToLine } from 'lucide-react';
import Link from 'next/link';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderActionsProps {
  onAutoGenerate: () => void;
  onAddPeriod: () => void;
  onDownload: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onAutoGenerate,
  onAddPeriod,
  onDownload
}) => {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#ea580c';

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button
        onClick={onAutoGenerate}
        style={{ backgroundColor: primaryColor }}
        className="h-14 px-8 rounded-2xl text-white font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <Zap size={18} />
        Initialize Auto-Sync
      </Button>

      <div className="flex items-center gap-3">
        <Link href={"/dashboard/admin/classes/class-details/add"}>
          <Button
            variant="ghost"
            className="h-14 px-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-2 hover:border-orange-600/30 transition-all shadow-lg"
          >
            <Plus size={18} />
            Node period
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          onClick={onDownload}
          className="h-14 px-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-2 hover:border-orange-600/30 transition-all shadow-lg text-slate-400"
        >
          <ArrowDownToLine size={18} />
          Protocol Export
        </Button>
      </div>
    </div>
  );
};

export default HeaderActions;