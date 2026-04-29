interface IconCircleProps {
  icon: string;
}

export default function IconCircle({ icon }: IconCircleProps) {
  return (
    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
      <span className="material-symbols-outlined text-primary text-5xl">{icon}</span>
    </div>
  );
}
