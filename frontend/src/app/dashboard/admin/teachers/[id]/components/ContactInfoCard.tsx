import Card from './ui/Card'

interface ContactInfo {
  email: string
  phone: string
  emergencyContact: string
  emergencyPhone: string
}

interface ContactInfoCardProps {
  contactInfo: ContactInfo
}

export default function ContactInfoCard({ contactInfo }: ContactInfoCardProps) {
  return (
    <Card className="p-6 flex flex-col gap-4 md:col-span-2">
      <h3 className="font-bold text-lg text-[#343A40] dark:text-white">
        Contact Information
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200/60 dark:border-gray-800 pt-4">
        <div>
          <p className="text-sm text-[#6C757D]">Email Address</p>
          <p className="font-medium text-[#343A40] dark:text-gray-200">
            {contactInfo.email}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#6C757D]">Phone Number</p>
          <p className="font-medium text-[#343A40] dark:text-gray-200">
            {contactInfo.phone}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#6C757D]">Emergency Contact</p>
          <p className="font-medium text-[#343A40] dark:text-gray-200">
            {contactInfo.emergencyContact}
          </p>
        </div>
        <div>
          <p className="text-sm text-[#6C757D]">Emergency Phone</p>
          <p className="font-medium text-[#343A40] dark:text-gray-200">
            {contactInfo.emergencyPhone}
          </p>
        </div>
      </div>
    </Card>
  )
}