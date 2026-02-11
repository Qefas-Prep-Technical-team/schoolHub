import Checkbox from './ui/Checkbox'
import Badge from './ui/Badge'
import Icon from './ui/Icon'
import Link from 'next/link'

export interface Teacher {
  id: string
  name: string
  email: string
  subjects: string[]
  assignedClasses: string[]
  status: 'active' | 'inactive'
  avatar: string
}

interface TeacherRowProps {
  teacher: Teacher
  selected: boolean
  onSelect: (id: string) => void
}

export default function TeacherRow({ teacher, selected, onSelect }: TeacherRowProps) {
  return (
    <tr className="hover:bg-neutral-200/50 dark:hover:bg-neutral-800/30">
      <td className="p-4">
        <Checkbox 
          checked={selected}
          onChange={() => onSelect(teacher.id)}
        />
      </td>
      <td className="p-4">
        <Link href={"/dashboard/admin/teachers/profilePage"} className="flex items-center gap-3">
          <img 
            className="size-10 rounded-full object-cover" 
            alt={`Profile picture of ${teacher.name}`} 
            src={teacher.avatar}
          />
          <div>
            <p className="font-medium text-neutral-800 dark:text-neutral-100">{teacher.name}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {teacher.id}</p>
          </div>
        </Link>
      </td>
      <td className="p-4 text-neutral-800 dark:text-neutral-200">
        {teacher.subjects.join(', ')}
      </td>
      <td className="p-4 text-neutral-800 dark:text-neutral-200">
        {teacher.assignedClasses.join(', ')}
      </td>
      <td className="p-4">
        <Badge variant={teacher.status}>
          {teacher.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="p-4 text-right">
        <button className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg">
          <Icon name="more_horiz" />
        </button>
      </td>
    </tr>
  )
}