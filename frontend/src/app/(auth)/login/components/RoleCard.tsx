import Link from "next/link";

interface RoleCardProps {
  href: string;
  icon: string;
  color: string;
  title: string;
  description: string;
}

export default function RoleCard({ href, icon, color, title, description }: RoleCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-1 flex-col gap-3 rounded-lg border border-[#ced1e8] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-${color}-500 dark:hover:border-${color}-500`}
    >
      <div className={`flex justify-center text-${color}-500`} style={{ fontSize: 28 }}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-[#0d0e1c] dark:text-white text-base font-bold leading-tight">
          {title}
        </h2>
        <p className="text-[#49509c] dark:text-slate-400 text-sm font-normal leading-normal">
          {description}
        </p>
      </div>
    </Link>
  );
}
