import Pagination from './Pagination'
import { Teacher } from './TeacherRow'
import TeacherRow from './TeacherRow'
import Checkbox from './ui/Checkbox'


interface TeacherTableProps {
  teachers: Teacher[]
  selectedTeachers: string[]
  onSelectTeacher: (id: string) => void
  onSelectAll: () => void
}

export default function TeacherTable({ 
  teachers, 
  selectedTeachers, 
  onSelectTeacher, 
  onSelectAll 
}: TeacherTableProps) {
  const allSelected = selectedTeachers.length === teachers.length && teachers.length > 0

  return (
    <div className="bg-neutral-100 dark:bg-background-dark border border-neutral-200/80 dark:border-neutral-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-neutral-200/80 dark:border-neutral-800">
            <tr>
              <th className="p-4 w-12">
                <Checkbox 
                  checked={allSelected}
                  onChange={onSelectAll}
                />
              </th>
              <th className="p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Teacher
              </th>
              <th className="p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Subjects
              </th>
              <th className="p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Assigned Classes
              </th>
              <th className="p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="p-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
            {teachers.map((teacher) => (
              <TeacherRow
                key={teacher.id}
                teacher={teacher}
                selected={selectedTeachers.includes(teacher.id)}
                onSelect={onSelectTeacher}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination totalItems={teachers.length} currentPage={1} />
    </div>
  )
}