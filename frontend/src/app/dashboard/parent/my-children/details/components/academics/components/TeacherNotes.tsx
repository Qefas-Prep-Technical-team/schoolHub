import Image from 'next/image'
import { MessageSquare } from 'lucide-react'

export default function TeacherNotes() {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/20 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-primary dark:text-blue-400">
        <MessageSquare className="size-5" />
        <h4 className="text-sm font-bold">Teacher&apos;s Note</h4>
      </div>

      <div className="relative">
        <span className="absolute -top-2 -left-1 text-4xl text-blue-200 dark:text-blue-800 font-serif leading-none">&ldquo;</span>
        <p className="text-sm text-text-main-light dark:text-text-main-dark italic leading-relaxed pl-4 relative z-10">
          Sarah is showing great improvement in calculus concepts this month. She was particularly engaged during our group project on practical geometry applications. I&apos;d encourage her to keep practicing the problem sets on weekends.
        </p>
        
        <div className="mt-4 flex items-center gap-3 pl-4">
          <div className="relative w-8 h-8">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1Yakt_10-95eLojnxVqGPl99YkE1iSH8oc-lZKwNaTHrWUh4gZyLNkGlHqznHKxcHtuAMF3zoEwzns3pbUGJNEUetR0vGLNDTSUYQtTl6DZ8cLk1BQMe-r0qGZP0sJx21mg2FpfsTc5jRbKJrtiot7vCP-NXltR4Pn7rAdbQU23nNusxqPtEyM0XAmCFBkR6DuPAgl-ptZsH0vC41L16VGzjojtrMivPtAC_8TYgZ4M29dqySH4XeesSAPXXpuoUKg-EkoDRUMFI"
              alt="Teacher Mr. Anderson Profile"
              fill
              className="rounded-full bg-gray-300 object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
              Mr. Anderson
            </p>
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
              Oct 10, 2023
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}