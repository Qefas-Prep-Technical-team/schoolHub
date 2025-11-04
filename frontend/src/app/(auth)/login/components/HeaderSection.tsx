export default function HeaderSection() {
  return (
    <>
      <div className="flex w-full justify-center">
        <div className="w-24 h-24 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full">
          <span className="material-symbols-outlined text-5xl text-primary">
            school
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-center">
        <p className="text-[#0d0e1c] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          Sign In As
        </p>
        <p className="text-[#49509c] dark:text-slate-400 text-base font-normal leading-normal">
          Choose your role to continue
        </p>
      </div>
    </>
  );
}
