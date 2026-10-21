import { Button } from '@/components/ui/button';
import { Mail, BookOpen } from 'lucide-react';

interface ClassBannerProps {
  title: string;
  description: string;
  onContactClick: () => void;
  onMaterialsClick: () => void;
}

export default function ClassBanner({ title, description, onContactClick, onMaterialsClick }: ClassBannerProps) {
  return (
    <div className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-rose-700 dark:from-pink-700 dark:to-rose-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 text-white shadow-sm relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-10 pointer-events-none scale-125 sm:scale-150 translate-x-1/4 -translate-y-1/4">
        <BookOpen size={240} />
      </div>

      <div className="relative z-10 max-w-2xl">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mb-2 sm:mb-3">
          Ready to keep learning in {title}?
        </h2>
        <p className="text-white/90 text-xs sm:text-sm lg:text-base leading-relaxed mb-5 sm:mb-6 max-w-xl">
          {description}
        </p>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4">
          <Button 
            onClick={onMaterialsClick}
            className="bg-white hover:bg-slate-50 text-pink-600 font-bold rounded-xl px-5 h-10 sm:h-11 shadow-xs text-xs sm:text-sm active:scale-95 transition-all"
          >
            Resume Learning
          </Button>
          <Button 
            onClick={onContactClick}
            variant="ghost" 
            className="hover:bg-white/10 text-white font-bold rounded-xl px-5 h-10 sm:h-11 flex items-center justify-center gap-2 text-xs sm:text-sm border border-white/20 active:scale-95 transition-all"
          >
            <Mail className="w-4 h-4" />
            Contact Instructor
          </Button>
        </div>
      </div>
    </div>
  );
}
