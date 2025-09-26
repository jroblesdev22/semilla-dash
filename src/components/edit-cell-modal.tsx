"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Cell, UpdateCellRequest } from "@/types/cell"
import { Loader2 } from "lucide-react"

interface EditCellModalProps {
  children: React.ReactNode
  cell: Cell
  onUpdateCell: (cellId: string, updateData: UpdateCellRequest) => Promise<void>
  updating: boolean
}

export function EditCellModal({
  children,
  cell,
  onUpdateCell,
  updating
}: EditCellModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(cell.name)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    try {
      await onUpdateCell(cell.id, {
        name: name.trim()
      })
      setOpen(false)
    } catch {
      // Error handling is done in parent component
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset form when opening
      setName(cell.name)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Célula</SheetTitle>
          <SheetDescription>
            Modifica el nombre de la célula. El curso no se puede cambiar.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          {/* Course info (read-only) */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: cell.course.color_hex }}
              />
              <div>
                <p className="font-semibold">{cell.course.name}</p>
                <p className="text-sm text-muted-foreground">
                  {cell.members.length} miembros
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la célula</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Célula A, Grupo 1, etc."
                required
                disabled={updating}
              />
            </div>
          </form>
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={updating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updating || !name.trim() || name.trim() === cell.name}
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}