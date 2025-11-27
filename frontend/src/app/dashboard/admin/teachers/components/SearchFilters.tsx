import Input from './ui/Input'
import Button from './ui/Button'

interface SearchFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export default function SearchFilters({ searchTerm, onSearchChange }: SearchFiltersProps) {
  return (
    <div className="bg-neutral-100 dark:bg-background-dark border border-neutral-200/80 dark:border-neutral-800 p-4 rounded-xl mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <Input
          icon="search"
          placeholder="Search by name, subject, or ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-grow"
        />
        <div className="flex gap-3 items-center">
          <Button variant="ghost" icon="expand_more">
            Subject
          </Button>
          <Button variant="ghost" icon="expand_more">
            Class Assigned
          </Button>
          <Button variant="ghost" icon="expand_more">
            Status
          </Button>
        </div>
      </div>
    </div>
  )
}