import { Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.div drag dragMomentum={false} className="fixed bottom-8 right-8 z-50 cursor-grab active:cursor-grabbing">
      <Link href="/dashboard/teacher/exams&quizzes/add-question">
        <button
          onClick={onClick}
          className="flex items-center justify-center size-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Add new question"
        >
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </motion.div>
  );
}
