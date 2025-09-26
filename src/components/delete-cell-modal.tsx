"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Cell } from "@/types/cell"
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteCellModalProps {
  children: React.ReactNode
  cell: Cell
  onDeleteCell: (cellId: string) => Promise<void>
  deleting: boolean
}

export function DeleteCellModal({
  children,
  cell,
  onDeleteCell,
  deleting
}: DeleteCellModalProps) {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await onDeleteCell(cell.id)
      setOpen(false)
    } catch {
      // Error handling is done in parent component
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eliminar Célula
          </SheetTitle>
          <SheetDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la célula y todos sus miembros serán desasignados.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: cell.course.color_hex }}
              />
              <h3 className="font-semibold">{cell.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Curso: {cell.course.name}
            </p>
            <p className="text-sm text-muted-foreground">
              Miembros: {cell.members.length}
            </p>
          </div>

          {cell.members.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Miembros que serán desasignados:</p>
              <ul className="list-disc list-inside space-y-1">
                {cell.members.map((member) => (
                  <li key={member.id}>
                    {member.name} {member.role === 'teacher' && '(Profesor)'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar Célula"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}