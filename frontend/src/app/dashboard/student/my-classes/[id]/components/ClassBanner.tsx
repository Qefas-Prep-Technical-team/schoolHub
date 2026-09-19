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
    <div className="w-full bg-pink-600 dark:bg-pink-700 rounded-[2rem] p-8 lg:p-12 text-white shadow-md relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none scale-150 translate-x-1/4 -translate-y-1/4">
        <BookOpen size={240} />
      </div>

      <div className="relative z-10 max-w-2xl">
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          Ready to keep learning in {title}?
        </h2>
        <p className="text-white/80 text-sm lg:text-base leading-relaxed mb-8 max-w-xl">
          {description}
        </p>
        
        <div className="flex flex-wrap items-center gap-4">
          <Button 
            onClick={onMaterialsClick}
            className="bg-white hover:bg-slate-50 text-pink-600 font-bold rounded-xl px-6 h-12"
          >
            Resume Learning
          </Button>
          <Button 
            onClick={onContactClick}
            variant="ghost" 
            className="hover:bg-white/10 text-white font-bold rounded-xl px-6 h-12 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contact Instructor
          </Button>
        </div>
      </div>
    </div>
  );
}
