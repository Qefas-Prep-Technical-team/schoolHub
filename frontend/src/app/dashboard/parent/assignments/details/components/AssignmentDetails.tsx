import { FileText, File, Download } from 'lucide-react'
import { Card } from './ui/Card'

interface Attachment {
  id: number
  name: string
  size: string
  type: 'pdf' | 'doc'
}

const attachments: Attachment[] = [
  { id: 1, name: 'Grading_Rubric.pdf', size: '245 KB', type: 'pdf' },
  { id: 2, name: 'Reading_Packet_Ch4.docx', size: '1.2 MB', type: 'doc' },
]

const fileIcons = {
  pdf: {
    icon: FileText,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  doc: {
    icon: File,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
}

export default function AssignmentDetails() {
  return (
    <Card>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="text-primary size-5" />
          Assignment Details
        </h3>
      </div>
      
      <div className="p-6 flex flex-col gap-6">
        {/* Instructions */}
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">
            Instructions
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Write a 500-700 word essay analyzing the socio-economic impacts of the Industrial Revolution on urban centers in the 19th century. 
            Focus specifically on housing conditions, labor shifts, and the emergence of new social classes. 
            <br/><br/>
            Please ensure you cite at least three sources using MLA format.
          </p>
        </div>

        {/* Attached Materials */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">
            Attached Materials
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attachments.map((attachment) => {
              const FileIcon = fileIcons[attachment.type].icon
              
              return (
                <a
                  key={attachment.id}
                  href="#"
                  className="group flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${fileIcons[attachment.type].color}`}>
                    <FileIcon className="size-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {attachment.size}
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}