import Card from './ui/Card'
import Tag from './ui/Tag'


interface ProfessionalInfo {
  department: string
  subjects: string[]
  assignedClasses: string[]
}

interface ProfessionalInfoCardProps {
  professionalInfo: ProfessionalInfo
}

export default function ProfessionalInfoCard({ professionalInfo }: ProfessionalInfoCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-[-0.015em]">
        Professional Information
      </h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="flex flex-col gap-1.5 border-t border-solid border-border-light dark:border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Department
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {professionalInfo.department}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-solid border-border-light dark:border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Subjects Taught
          </p>
          <div className="flex flex-wrap gap-2">
            {professionalInfo.subjects.map((subject, index) => (
              <Tag key={index} variant="primary">
                {subject}
              </Tag>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 border-t border-solid border-border-light dark:border-border-dark py-4 sm:col-span-2">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Assigned Classes
          </p>
          <div className="flex flex-wrap gap-2">
            {professionalInfo.assignedClasses.map((className, index) => (
              <Tag key={index} variant="secondary">
                {className}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}