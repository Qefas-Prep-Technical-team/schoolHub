// app/student/classes/[id]/components/ClassHeader.tsx

interface ClassHeaderProps {
  classItem: {
    title: string;
    code: string;
    subject: string;
  };
}

export default function ClassHeader({ classItem }: ClassHeaderProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[240px] bg-gradient-to-br from-pink-600 to-rose-700">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: `url(/image/backgroundSchool.jpg)`
        }}
      />
      <div className="relative z-10 p-8 flex flex-col justify-end h-full bg-gradient-to-t from-black/60 to-transparent">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {classItem.title}
        </h1>
        <p className="text-lg text-gray-200">
          {classItem.code} • {classItem.subject}
        </p>
      </div>
    </div>
  )
}