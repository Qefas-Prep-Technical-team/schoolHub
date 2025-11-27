// app/components/PersonalInformation.jsx
export default function PersonalInformation() {
  const personalInfo = [
    { label: 'Full Name', value: 'Eleanor Vance' },
    { label: 'Gender', value: 'Female' },
    { label: 'Date of Birth', value: '2008-05-12' },
    { label: 'Address', value: '123 Innovation Drive, Tech City, 90210' },
    { label: 'Email Address', value: 'eleanor.v@example.com' },
    { label: 'Phone Number', value: '+1 (555) 123-4567' },
    { label: 'Admission Date', value: '2022-09-01' },
    { label: 'Student Category', value: 'General' },
  ]

  return (
    <div className="bg-white dark:bg-[#1C252E] rounded-xl shadow-sm p-6">
      <h2 className="text-[#0e141b] dark:text-slate-200 text-lg font-bold leading-tight tracking-[-0.015em] mb-4">
        Personal Information
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        {personalInfo.map((info, index) => (
          <div key={index} className="flex flex-col gap-1 border-t border-solid border-slate-200 dark:border-slate-700 py-4">
            <p className="text-[#4e7397] dark:text-slate-400 text-sm font-normal leading-normal">
              {info.label}
            </p>
            <p className="text-[#0e141b] dark:text-slate-300 text-sm font-normal leading-normal">
              {info.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}