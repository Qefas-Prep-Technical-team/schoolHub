import { ReactNode } from 'react'

interface TableProps {
  headers: string[]
  children: ReactNode
  className?: string
}

export function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-border-light dark:border-border-dark ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="bg-background-light dark:bg-background-dark text-text-sec-light dark:text-text-sec-dark">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark bg-surface-light dark:bg-surface-dark">
          {children}
        </tbody>
      </table>
    </div>
  )
}

interface TableRowProps {
  children: ReactNode
  className?: string
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={className}>{children}</tr>
}

interface TableCellProps {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>
}