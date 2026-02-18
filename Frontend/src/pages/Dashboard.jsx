import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CheckSquare,
  LogOut,
  Plus,
  ClipboardList,
  Pencil,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { TaskFormDialog } from '@/components/TaskFormDialog'
import { useTasks } from '@/hooks/useTasks'

function SkeletonTaskCard() {
  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <Skeleton className="h-3.5 w-full mb-2" />
        <Skeleton className="h-3.5 w-4/5" />
      </CardContent>
      <CardFooter className="pt-0 border-t border-border mt-auto">
        <div className="flex items-center justify-between w-full pt-3">
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">
        Nenhuma tarefa encontrada
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Crie sua primeira tarefa clicando no botão acima e comece a organizar seu dia.
      </p>
    </div>
  )
}

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">
            {task.title}
          </h3>
          <Badge status={task.status} className="shrink-0" />
        </div>
      </CardHeader>

      {task.description && (
        <CardContent className="pb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        </CardContent>
      )}

      <CardFooter className="pt-0 border-t border-border mt-auto">
        <div className="flex items-center justify-end w-full pt-3 gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
                <AlertDialogDescription>
                  A tarefa <strong>"{task.title}"</strong> será excluída permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(task.id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendentes', value: 'pending' },
  { label: 'Em andamento', value: 'in_progress' },
  { label: 'Concluídas', value: 'completed' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks()

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeFilter)

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Você saiu da conta.')
    navigate('/login')
  }

  const handleOpenCreate = () => {
    setEditingTask(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (task) => {
    setEditingTask(task)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data)
        toast.success('Tarefa atualizada!')
      } else {
        await createTask(data)
        toast.success('Tarefa criada!')
      }
    } catch (error) {
      toast.error(error.message || 'Ocorreu um erro. Tente novamente.')
      throw error
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      toast.success('Tarefa excluída.')
    } catch (error) {
      toast.error(error.message || 'Erro ao excluir tarefa.')
    }
  }

  const confirmLogout = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza que deseja sair?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será desconectado da sua conta e redirecionado para a tela de login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
              <CheckSquare className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">TodoList</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden sm:block text-sm text-muted-foreground">
                Olá,{' '}
                <span className="font-medium text-foreground">
                  {user.name.split(' ')[0]}
                </span>
              </span>
            )}
            {confirmLogout}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Cabeçalho da seção */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Minhas Tarefas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading
                ? 'Carregando...'
                : tasks.length === 0
                ? 'Nenhuma tarefa ainda'
                : activeFilter === 'all'
                ? `${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''}`
                : `${filteredTasks.length} de ${tasks.length} tarefa${tasks.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={activeFilter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Grid de tarefas */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTaskCard key={i} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de criar/editar tarefa */}
      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
    </div>
  )
}
