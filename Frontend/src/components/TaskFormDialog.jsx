import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Type, AlignLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Título é obrigatório")
    .max(255, "Título muito longo"),
  description: z.string().max(500, "Descrição muito longa").optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export function TaskFormDialog({ open, onOpenChange, onSubmit, task }) {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", status: "pending" },
  });

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description ?? "",
              status: task.status,
            }
          : { title: "", description: "", status: "pending" },
      );
    }
  }, [open, task, reset]);

  async function handleFormSubmit(data) {
    await onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-border/40 shadow-xl bg-background/95 backdrop-blur-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-muted/20">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da sua tarefa abaixo."
              : "Preencha os campos para criar uma nova tarefa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-6 space-y-5">
            {/* Título */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="flex items-center gap-2 text-muted-foreground font-medium"
              >
                <Type className="h-4 w-4" /> Título
              </Label>
              <Input
                id="title"
                className="h-10 bg-background/50 focus:bg-background transition-colors"
                placeholder="Ex: Finalizar relatório..."
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="flex items-center gap-2 text-muted-foreground font-medium"
              >
                <AlignLeft className="h-4 w-4" /> Descrição{" "}
                <span className="text-xs font-normal opacity-70">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="description"
                className="min-h-[140px] bg-background/50 focus:bg-background transition-colors"
                placeholder="Adicione detalhes, notas ou subtarefas..."
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground font-medium">
                <CheckCircle2 className="h-4 w-4" /> Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <SelectTrigger className="h-10 bg-background/50 focus:bg-background transition-colors">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 border-t border-border/40 bg-muted/20 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-2 sm:mt-0"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Criar Tarefa"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
