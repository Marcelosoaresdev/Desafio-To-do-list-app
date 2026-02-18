import * as React from 'react'
import { cn } from '@/lib/utils'

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
}

const statusLabels = {
  pending: 'Pendente',
  in_progress: 'Em progresso',
  completed: 'Concluída',
}

function Badge({ status, className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        statusStyles[status] ?? 'bg-muted text-muted-foreground',
        className
      )}
      {...props}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}

export { Badge, statusLabels }
