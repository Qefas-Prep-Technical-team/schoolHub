interface ClassHeaderProps {
  classItem: {
    title: string;
    code: string;
    subject: string;
  };
}

export default function ClassHeader({ classItem }: ClassHeaderProps) {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[160px] sm:min-h-[200px] md:min-h-[220px] bg-gradient-to-br from-pink-600 via-rose-600 to-rose-700 shadow-sm">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage: `url(/image/backgroundSchool.jpg)`
        }}
      />
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col justify-end h-full bg-gradient-to-t from-black/75 via-black/35 to-transparent">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/20">
            {classItem.code}
          </span>
          <span className="text-white/80 text-xs font-semibold truncate">
            {classItem.subject}
          </span>
        </div>
        <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
          {classItem.title}
        </h1>
      </div>
    </div>
  );
}