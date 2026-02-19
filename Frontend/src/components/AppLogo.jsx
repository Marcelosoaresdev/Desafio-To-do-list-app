import { CheckSquare } from 'lucide-react'

export function AppLogo() {
  return (
    <div className="flex items-center justify-center gap-2.5 mb-8">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
        <CheckSquare className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="text-2xl font-bold tracking-tight">TodoList</span>
    </div>
  )
}
