export default function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center bg-card-light dark:bg-card-dark shadow-sm border border-slate-200 dark:border-slate-700 rounded-xl p-8 sm:p-10">
      {children}
    </div>
  );
}
