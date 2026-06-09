// app/student/classes/[id]/components/ClassOverview.tsx
import { useState, useEffect } from 'react'
import { Mail, Phone, ArrowLeft, ArrowRight, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TeacherType {
  name: string
  title: string
  avatar: string
  email: string
  phone?: string
}

interface ClassOverviewProps {
  teachers: TeacherType[]
  description: string
}

export default function ClassOverview({ teachers, description }: ClassOverviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isContactOpen, setIsContactOpen] = useState(false)

  // Ensure we have at least one teacher to show
  const activeTeachers = teachers.length > 0 ? teachers : [{
    name: 'Unassigned Teacher',
    title: 'Class Teacher',
    avatar: `https://ui-avatars.com/api/?name=T&background=6366f1&color=fff&size=128`,
    email: '',
    phone: ''
  }]

  const currentTeacher = activeTeachers[currentIndex]

  // Auto slide effect
  useEffect(() => {
    if (activeTeachers.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeTeachers.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [activeTeachers.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeTeachers.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeTeachers.length) % activeTeachers.length)
  }

  return (
    <>
      <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-md">
        <CardContent className="p-6">
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            
            {/* Sliding Teacher Card Info */}
            <div className="flex items-center gap-4 transition-all duration-500 ease-in-out">
              <div 
                className="w-16 h-16 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-800 shadow-md flex-shrink-0"
                style={{ backgroundImage: `url(${currentTeacher.avatar})` }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                    {currentTeacher.name}
                  </h3>
                  {activeTeachers.length > 1 && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                      {currentIndex + 1} of {activeTeachers.length}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {currentTeacher.title}
                </p>
              </div>
            </div>

            {/* Slider Controls & Action */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              {activeTeachers.length > 1 && (
                <div className="flex items-center gap-1.5 mr-2">
                  <button 
                    onClick={prevSlide}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    aria-label="Previous teacher"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                    aria-label="Next teacher"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {currentTeacher.email && (
                <Button 
                  onClick={() => setIsContactOpen(true)}
                  variant="outline" 
                  className="gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
              Course Description
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Premium Contact Dialog Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-hidden animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  Contact Instructor
                </h3>
                <button 
                  onClick={() => setIsContactOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-semibold leading-none"
                >
                  &times;
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Reach out to {currentTeacher.name} for questions or support.
              </p>
            </div>

            {/* Teacher Details Summary */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 mb-6">
              <div 
                className="w-12 h-12 rounded-full bg-cover bg-center shadow-sm"
                style={{ backgroundImage: `url(${currentTeacher.avatar})` }}
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white truncate">{currentTeacher.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentTeacher.title}</p>
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {/* Email Button */}
              {currentTeacher.email && (
                <a 
                  href={`mailto:${currentTeacher.email}`}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50 text-sm text-left">Send Email</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{currentTeacher.email}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {/* Phone Button */}
              <a 
                href={currentTeacher.phone ? `tel:${currentTeacher.phone}` : '#'}
                onClick={(e) => {
                  if (!currentTeacher.phone) {
                    e.preventDefault();
                  }
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 ${
                  currentTeacher.phone 
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60 group cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/40'
                } transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    currentTeacher.phone 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  } transition-all`}>
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50 text-sm text-left">Call / Phone Number</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentTeacher.phone || 'Phone number not registered'}
                    </p>
                  </div>
                </div>
                {currentTeacher.phone && (
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                )}
              </a>
            </div>

            {/* Footer Close */}
            <div className="mt-6">
              <Button 
                onClick={() => setIsContactOpen(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold py-3 rounded-2xl transition-all"
              >
                Close Dialog
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}