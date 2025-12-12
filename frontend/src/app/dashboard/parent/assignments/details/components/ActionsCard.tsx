import { Mail, BarChart3, FolderArchive } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export default function ActionsCard() {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">
        Parent Tools
      </p>
      
      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          className="flex items-center justify-center gap-2 w-full py-3"
        >
          <Mail className="size-5" />
          Message Teacher
        </Button>
        
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-2 w-full py-3"
        >
          <BarChart3 className="size-5" />
          See Subject Performance
        </Button>
        
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-2 w-full py-3"
        >
          <FolderArchive className="size-5" />
          Download All Files
        </Button>
      </div>
    </Card>
  )
}