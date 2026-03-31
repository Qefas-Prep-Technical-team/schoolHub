export default function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed pb-8 text-center">
      {children}
    </p>
  );
}
