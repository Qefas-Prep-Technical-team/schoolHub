export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 p-6 flex justify-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A2540]">
          <span className="material-symbols-outlined text-white text-2xl">
            school
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#0A2540] dark:text-background-light">
          SchoolHub
        </h2>
      </div>
    </header>
  );
}
