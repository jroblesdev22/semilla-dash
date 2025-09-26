"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Cell, Student, StudentsByCourseResponse } from "@/types/cell"
import { Loader2, Users, GraduationCap } from "lucide-react"

interface AddStudentsModalProps {
  children: React.ReactNode
  cell: Cell
  onAddStudents: (studentIds: string[]) => Promise<void>
  getStudentsByCourse: (courseId: string) => Promise<StudentsByCourseResponse>
  processing: boolean
}

export function AddStudentsModal({
  children,
  cell,
  onAddStudents,
  getStudentsByCourse,
  processing
}: AddStudentsModalProps) {
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true)
    try {
      const data = await getStudentsByCourse(cell.course_id)
      setStudents(data.students)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoadingStudents(false)
    }
  }, [cell.course_id, getStudentsByCourse])
  // Fetch students when modal opens
  useEffect(() => {
    if (open) {
      fetchStudents()
    }
  }, [open, fetchStudents])


  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map(student => student.id))
    }
  }

  const handleSubmit = async () => {
    if (selectedStudentIds.length === 0) return

    try {
      await onAddStudents(selectedStudentIds)
      handleClose()
    } catch {
      // Error handling is done in parent component
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedStudentIds([])
    setStudents([])
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agregar Estudiantes
          </SheetTitle>
          <SheetDescription>
            Agrega estudiantes disponibles a la célula &quot;{cell.name}&quot;.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          {/* Cell info */}
          <div className="rounded-lg border p-4 bg-muted/50 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: cell.course.color_hex }}
              />
              <div>
                <p className="font-semibold">{cell.name}</p>
                <p className="text-sm text-muted-foreground">
                  Curso: {cell.course.name} • Miembros actuales: {cell.members.length}
                </p>
              </div>
            </div>
          </div>

          {loadingStudents ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando estudiantes disponibles...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No hay estudiantes disponibles para agregar a esta célula.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Todos los estudiantes del curso ya están asignados a una célula.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Estudiantes disponibles ({students.length})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={processing}
                >
                  {selectedStudentIds.length === students.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </Button>
              </div>

              <Separator />

              <div className="max-h-60 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudentIds.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                      disabled={processing}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={student.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {student.name}
                      </label>
                      {student.email && (
                        <p className="text-xs text-muted-foreground">
                          {student.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedStudentIds.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {selectedStudentIds.length} estudiante{selectedStudentIds.length > 1 ? 's' : ''} seleccionado{selectedStudentIds.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>

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
            disabled={processing || selectedStudentIds.length === 0}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando...
              </>
            ) : (
              `Agregar ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ''}`
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}