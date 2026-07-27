export default function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
      {children}
    </p>
  );
}
