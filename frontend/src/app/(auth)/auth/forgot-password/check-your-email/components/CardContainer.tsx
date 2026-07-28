export default function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden w-full rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-slate-200/50 dark:shadow-none text-center space-y-6">
      {children}
    </div>
  );
}
