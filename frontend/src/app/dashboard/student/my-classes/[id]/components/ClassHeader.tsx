// app/student/classes/[id]/components/ClassHeader.tsx

import { ClassDetail } from "./classData"


interface ClassHeaderProps {
  classItem: ClassDetail
}

export default function ClassHeader({ classItem }: ClassHeaderProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[240px] bg-gradient-to-br from-blue-600 to-purple-700">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuA0TnjDhPvXNxLU7UOKZ2Q2uCHeQCqY_bC69op_kH7yyjNgY3NX0-oMn0brWzIeuOOkhtRw-RWiGRIcUNtDZ_Bubo9p8HffsUODLTVCaoXbs6Hb_IRSg5LJ9KhoUezb_SkJWOI2jC0f8p5Fp4GNsmUQayhqSszDt52QtQiG_9hvWVanJHPdDxogP3vLXvBmtkozaxemjuVd3Zzg2mn_jDQZ4YJW0drm8fpArL4KqUZ850McmlOf8Qn_mgIexZsxP5lmlvHiSwYR118)'
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