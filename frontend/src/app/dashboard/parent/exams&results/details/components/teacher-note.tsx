"use client"

export default function TeacherNote() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-5 border border-blue-100 dark:border-gray-700">
      <div className="flex gap-3 mb-2">
        <div 
          className="size-8 rounded-full bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBtJULwU_m6SOwm-bZCB6BkTTAgY-HlIR2-7BjINIK4Ai38Tp2wkpCC-rprTky-E0ZIi4r0q_R8bHxTO9SLWAWqvmZd3idmgEUepEz4EHQqeZCyN9U7eB9yEs-CHguoAtrPWcTFkDVEl8JYiF6EKkM90Rk2RDV2V2-tnjLhfWZoxkHWZYCPCsKEZQrDkbvokL1wIghqZhIYDJqCJcP2prPhOGp8O-FcqEIHcxEyzi69dpk1q_wYp6xjZCLPTcn43c_sdYmo_aL5uIc")'
          }}
        />
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            Mr. Anderson
          </p>
          <p className="text-xs text-gray-500">Mathematics Teacher</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 italic">
        &apos; Alex showed great understanding of geometric concepts but struggled slightly with the calculus section. I recommend reviewing the supplementary sheets I sent home.&apos;
      </p>
    </div>
  )
}