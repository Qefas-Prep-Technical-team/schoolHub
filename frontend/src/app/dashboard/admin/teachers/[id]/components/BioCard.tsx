import Card from './ui/Card'

interface BioCardProps {
  bio: string
}

export default function BioCard({ bio }: BioCardProps) {
  return (
    <Card className="mt-6 p-6">
      <h3 className="font-bold text-lg text-[#343A40] dark:text-white">
        Personal Summary
      </h3>
      <p className="mt-3 border-t border-gray-200/60 dark:border-gray-800 pt-3 text-[#6C757D]">
        {bio}
      </p>
    </Card>
  )
}