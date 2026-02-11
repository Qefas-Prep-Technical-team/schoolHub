import { Lightbulb } from 'lucide-react'

export default function ParentTip() {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-primary p-6 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
      <div className="flex items-start gap-3">
        <Lightbulb className="text-indigo-100 size-8" />
        <div>
          <h4 className="font-bold text-lg mb-1">Parent Tip</h4>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Ask James about the &apos; tenement housing &apos; section of his essay. He showed great insight there!
          </p>
        </div>
      </div>
    </div>
  )
}