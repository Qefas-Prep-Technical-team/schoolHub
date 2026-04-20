import Card from './ui/Card'

interface PersonalInfo {
  fullName: string
  gender: string
  email: string
  phone: string
  address: string
  highestQualification: string
  yearsOfExperience: string
}

interface PersonalInfoCardProps {
  personalInfo: PersonalInfo
}

export default function PersonalInfoCard({ personalInfo }: PersonalInfoCardProps) {
  return (
    <Card className="p-6">
      <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-[-0.015em]">
        Personal Information
      </h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="flex flex-col gap-1 border-t border-solid border-border-light dark:border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Full Name
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {personalInfo.fullName}
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t border-solid border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Gender
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {personalInfo.gender}
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t border-solid border-border-light dark:border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Email Address
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {personalInfo.email}
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t border-solid border-border-light dark:border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Phone Number
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {personalInfo.phone}
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t border-solid border-border-light dark:border-border-dark py-4 sm:col-span-2">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Address
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {personalInfo.address}
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t border-solid border-border-light dark:border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Highest Qualification
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {personalInfo.highestQualification}
          </p>
        </div>
        <div className="flex flex-col gap-1 border-t border-solid border-border-light dark:border-border-dark py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
            Years of Experience
          </p>
          <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
            {personalInfo.yearsOfExperience}
          </p>
        </div>
      </div>
    </Card>
  )
}