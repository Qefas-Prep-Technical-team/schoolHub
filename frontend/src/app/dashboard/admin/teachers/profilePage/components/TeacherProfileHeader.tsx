import Badge from './ui/Badge'
import Button from './ui/Button'

interface TeacherProfileHeaderProps {
  teacher: {
    name: string
    subjects: string[]
    assignedClasses: string[]
    avatar: string
    status: 'active' | 'inactive'
  }
}

export default function TeacherProfileHeader({ teacher }: TeacherProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-800">
      <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
              style={{ backgroundImage: `url(${teacher.avatar})` }}
            />
            <div className="absolute bottom-1 right-1">
              <Badge variant={teacher.status}>
                {teacher.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-[#343A40] dark:text-white">
              {teacher.name}
            </p>
            <p className="text-base font-normal leading-normal text-[#6C757D]">
              {teacher.subjects.join(', ')}
            </p>
            <p className="text-base font-normal leading-normal text-[#6C757D]">
              Assigned Classes: {teacher.assignedClasses.join(', ')}
            </p>
          </div>
        </div>
        
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:items-center">
          <Button variant="secondary" icon="edit" className="flex-1 sm:flex-auto">
            Edit Profile
          </Button>
          <Button variant="secondary" icon="lock_reset" className="flex-1 sm:flex-auto">
            Reset Password
          </Button>
          <Button variant="primary" icon="mail" className="flex-1 sm:flex-auto">
            Message
          </Button>
        </div>
      </div>
    </div>
  )
}