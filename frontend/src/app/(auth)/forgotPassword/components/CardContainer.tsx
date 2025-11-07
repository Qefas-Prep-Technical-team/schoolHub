export default function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8 w-full bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-8 sm:p-10">
      {children}
    </div>
  );
}
