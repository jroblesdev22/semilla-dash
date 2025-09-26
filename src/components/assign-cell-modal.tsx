"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { CreateCellRequest, AssignUserToCellRequest, Cell } from "@/types/cell"
import { Loader2, Plus } from "lucide-react"

interface Course {
  id: string
  name: string
  color_hex: string
}

interface AssignCellModalProps {
  children: React.ReactNode
  userId: string
  userName: string
  onAssignToCell: (assignData: AssignUserToCellRequest) => Promise<void>
  onCreateAndAssignCell: (cellData: CreateCellRequest) => Promise<void>
  processing: boolean
}

export function AssignCellModal({
  children,
  userId,
  userName,
  onAssignToCell,
  onCreateAndAssignCell,
  processing
}: AssignCellModalProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'assign' | 'create'>('assign')

  // Para asignar a célula existente
  const [selectedCellId, setSelectedCellId] = useState("")
  const [cells, setCells] = useState<Cell[]>([])

  // Para crear nueva célula
  const [newCellName, setNewCellName] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [courses, setCourses] = useState<Course[]>([])

  const [loadingData, setLoadingData] = useState(false)

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Fetch both cells and courses in parallel
      const [cellsResponse, coursesResponse] = await Promise.all([
        fetch('/api/cells'),
        fetch('/api/courses')
      ])

      const cellsData = await cellsResponse.json()
      const coursesData = await coursesResponse.json()

      setCells(cellsData.cells || [])
      setCourses(coursesData.courses || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'assign' && selectedCellId) {
      try {
        await onAssignToCell({
          user_id: userId,
          cell_id: selectedCellId
        })
        handleClose()
      } catch {
        // Error handling is done in parent component
      }
    } else if (mode === 'create' && newCellName.trim() && selectedCourseId) {
      try {
        await onCreateAndAssignCell({
          name: newCellName.trim(),
          course_id: selectedCourseId,
          user_id: userId,
          assign_user: true
        })
        handleClose()
      } catch {
        // Error handling is done in parent component
      }
    }
  }

  const handleClose = () => {
    setOpen(false)
    setMode('assign')
    setSelectedCellId("")
    setNewCellName("")
    setSelectedCourseId("")
  }

  const selectedCell = cells.find(cell => cell.id === selectedCellId)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Asignar Célula a {userName}</SheetTitle>
          <SheetDescription>
            Asigna al usuario a una célula existente o crea una nueva célula.
          </SheetDescription>
        </SheetHeader>

        {loadingData ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando datos...</span>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            {/* Mode selector */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'assign' ? 'default' : 'outline'}
                onClick={() => setMode('assign')}
                disabled={processing}
                size="sm"
              >
                Célula Existente
              </Button>
              <Button
                type="button"
                variant={mode === 'create' ? 'default' : 'outline'}
                onClick={() => setMode('create')}
                disabled={processing}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva Célula
              </Button>
            </div>

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'assign' ? (
                <div className="space-y-2">
                  <Label htmlFor="cell">Seleccionar Célula</Label>
                  <Select value={selectedCellId} onValueChange={setSelectedCellId} required disabled={processing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una célula" />
                    </SelectTrigger>
                    <SelectContent>
                      {cells.map((cell) => (
                        <SelectItem key={cell.id} value={cell.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-sm"
                              style={{ backgroundColor: cell.course.color_hex }}
                            />
                            <span>{cell.name}</span>
                            <span className="text-muted-foreground text-xs">
                              ({cell.course.name})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCell && (
                    <div className="text-sm text-muted-foreground">
                      Curso: {selectedCell.course.name} • Miembros: {selectedCell.members.length}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newCellName">Nombre de la nueva célula</Label>
                    <Input
                      id="newCellName"
                      value={newCellName}
                      onChange={(e) => setNewCellName(e.target.value)}
                      placeholder="Ej: Célula A, Grupo 1, etc."
                      required
                      disabled={processing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Curso</Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId} required disabled={processing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-sm"
                                style={{ backgroundColor: course.color_hex }}
                              />
                              <span>{course.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </form>
          </div>
        )}

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={processing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              processing ||
              loadingData ||
              (mode === 'assign' && !selectedCellId) ||
              (mode === 'create' && (!newCellName.trim() || !selectedCourseId))
            }
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'assign' ? 'Asignando...' : 'Creando y asignando...'}
              </>
            ) : (
              mode === 'assign' ? 'Asignar a Célula' : 'Crear y Asignar'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}