import { Plus } from 'lucide-react';
import Link from 'next/link';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Link href="/dashboard/teacher/exams&quizzes/add-question" >

    <button
      onClick={onClick}
      className="fixed cursor-pointer bottom-8 right-8 flex items-center justify-center size-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 z-50"
      aria-label="Add new question"
    >
      <Plus className="w-6 h-6" />
    </button>
    </Link>
  );
}