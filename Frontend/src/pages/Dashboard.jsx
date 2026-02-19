import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CheckSquare,
  LogOut,
  Plus,
  ClipboardList,
  Pencil,
  Trash2,
  AlertTriangle,
  Circle,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/components/ui/alert-dialog";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { useTasks } from "@/hooks/useTasks";

const FILTERS = [
  { label: "Todas", value: "all" },
  { label: "Pendentes", value: "pending" },
  { label: "Em andamento", value: "in_progress" },
  { label: "Concluídas", value: "completed" },
];

const STATUS_BADGE = {
  pending: { variant: "outline", label: "Pendente" },
  in_progress: { variant: "secondary", label: "Em andamento" },
  completed: { variant: "default", label: "Concluída" },
};

function SkeletonTaskCard({ variant = "text" }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-5 w-20 rounded-full shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 space-y-2">
        {/* description lines */}
        {(variant === "text" || variant === "mixed") && (
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        )}

        {/* checklist items */}
        {(variant === "items" || variant === "mixed") && (
          <div className="space-y-2">
            {Array.from({ length: variant === "mixed" ? 2 : 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded shrink-0" />
                <Skeleton className={cn("h-3.5", i % 2 === 0 ? "w-3/5" : "w-2/4")} />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-2.5 border-t border-border mt-auto">
        <div className="flex items-center justify-end w-full gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}

const SKELETON_VARIANTS = ["text", "items", "mixed", "text", "items", "mixed"];

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4">
        <ClipboardList className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onToggleStatus, onToggleItem, index }) {
  const isCompleted = task.status === "completed";
  const badge = STATUS_BADGE[task.status] ?? {
    variant: "outline",
    label: task.status,
  };
  const hasItems = Array.isArray(task.items) && task.items.length > 0;

  return (
    <Card
      className={cn(
        "flex flex-col min-h-[180px] transition-all duration-200 hover:shadow-md animate-fade-in-up",
        isCompleted && "opacity-75",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "text-base font-semibold leading-snug line-clamp-2",
              isCompleted
                ? "line-through text-muted-foreground"
                : "text-foreground",
            )}
          >
            {task.title}
          </h3>
          <Badge variant={badge.variant} className="shrink-0">
            {badge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 space-y-2">
        {task.description && (
          <p
            className={cn(
              "text-sm leading-relaxed line-clamp-3 whitespace-pre-line",
              isCompleted
                ? "text-muted-foreground/60 line-through"
                : "text-muted-foreground",
            )}
          >
            {task.description}
          </p>
        )}

        {hasItems && (
          <ul className="space-y-1.5">
            {task.items.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleItem(task.id, item.id)}
                  className={cn(
                    "flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors",
                    item.completed
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-border bg-background hover:border-emerald-500",
                  )}
                  title={item.completed ? "Desmarcar item" : "Marcar item"}
                >
                  {item.completed && (
                    <svg
                      viewBox="0 0 10 8"
                      fill="none"
                      className="w-2.5 h-2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 4l2.5 2.5L9 1" />
                    </svg>
                  )}
                </button>
                <span
                  className={cn(
                    "text-sm leading-snug",
                    item.completed
                      ? "line-through text-muted-foreground/50"
                      : "text-muted-foreground",
                  )}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!task.description && !hasItems && (
          <p className="text-xs text-muted-foreground/40 italic">Sem descrição</p>
        )}
      </CardContent>

      <CardFooter className="px-4 py-2.5 border-t border-border mt-auto">
        <div className="flex items-center justify-end w-full gap-1">
          <button
            onClick={() => onToggleStatus(task)}
            className={cn(
              "flex items-center justify-center w-7 h-7 rounded-md cursor-pointer",
              "transition-colors duration-150",
              isCompleted
                ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            title={isCompleted ? "Reabrir tarefa" : "Marcar como concluída"}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => onEdit(task)}
            className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150"
            title="Editar tarefa"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                title="Excluir tarefa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 shrink-0 mb-2">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <AlertDialogTitle className="text-xl">
                  Excluir tarefa?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  A tarefa{" "}
                  <span className="font-medium text-foreground">
                    "{task.title}"
                  </span>{" "}
                  será excluída permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="w-full sm:w-auto">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => onDelete(task.id)}
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

function LogoutButton({ onConfirm, userName }) {
  return (
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
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 shrink-0 mb-2">
            <LogOut className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-xl">
            Encerrar sessão?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {userName ? `${userName}, você` : "Você"} será desconectado(a) e
            redirecionado para a tela de login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-full sm:w-auto">
            Permanecer
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="w-full sm:w-auto">
            Sair da Conta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getTaskCountLabel(tasks, filteredTasks, activeFilter, isLoading) {
  if (isLoading) return "Carregando...";
  if (tasks.length === 0) return "Nenhuma tarefa ainda";
  if (activeFilter === "all")
    return `${tasks.length} tarefa${tasks.length !== 1 ? "s" : ""}`;
  return `${filteredTasks.length} de ${tasks.length} tarefa${tasks.length !== 1 ? "s" : ""}`;
}

function parseUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleItem } = useTasks();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredTasks =
    activeFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === activeFilter);

  const user = parseUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Você saiu da conta.");
    navigate("/login");
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
        toast.success("Tarefa atualizada!");
      } else {
        await createTask(data);
        toast.success("Tarefa criada!");
      }
    } catch (error) {
      toast.error(error.message || "Ocorreu um erro. Tente novamente.");
      throw error;
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === "completed" ? "pending" : "completed";
      await updateTask(task.id, { status: newStatus });
      toast.success(
        newStatus === "completed" ? "Tarefa concluída!" : "Tarefa reaberta.",
      );
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      toast.success("Tarefa excluída.");
    } catch (error) {
      toast.error(error.message || "Erro ao excluir tarefa.");
    }
  };

  const emptyStateProps =
    tasks.length === 0
      ? {
          title: "Nenhuma tarefa ainda",
          description:
            'Clique em "Nova Tarefa" para começar a organizar o seu dia.',
        }
      : {
          title: "Nenhuma tarefa nesta categoria",
          description: "Tente selecionar outro filtro ou crie uma nova tarefa.",
        };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
              <CheckSquare className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">TodoList</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden sm:block text-sm text-muted-foreground">
                Olá,{" "}
                <span className="font-medium text-foreground">
                  {user.name.split(" ")[0]}
                </span>
              </span>
            )}
            <LogoutButton
              onConfirm={handleLogout}
              userName={user?.name?.split(" ")[0]}
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Minhas Tarefas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {getTaskCountLabel(tasks, filteredTasks, activeFilter, isLoading)}
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Filtros — segmented control */}
        <div className="flex gap-1 p-1 bg-muted mx-auto rounded-xl mb-5 w-fit">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "px-2.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
                activeFilter === filter.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/60",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKELETON_VARIANTS.map((variant, i) => (
              <SkeletonTaskCard key={i} variant={variant} />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState {...emptyStateProps} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onToggleItem={toggleItem}
              />
            ))}
          </div>
        )}
      </main>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
    </div>
  );
}
