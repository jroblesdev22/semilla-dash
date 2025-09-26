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
import { CreateCellRequest } from "@/types/cell"
import { Loader2 } from "lucide-react"

interface Course {
  id: string
  name: string
  color_hex: string
}

interface CreateCellModalProps {
  children: React.ReactNode
  onCreateCell: (cellData: CreateCellRequest) => Promise<void>
  creating: boolean
}

export function CreateCellModal({ children, onCreateCell, creating }: CreateCellModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [courseId, setCourseId] = useState("")
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Fetch courses when modal opens
  useEffect(() => {
    if (open) {
      fetchCourses()
    }
  }, [open])

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !courseId) {
      return
    }

    try {
      await onCreateCell({
        name: name.trim(),
        course_id: courseId
      })

      // Reset form and close modal on success
      setName("")
      setCourseId("")
      setOpen(false)
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form when closing
      setName("")
      setCourseId("")
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Crear Nueva Célula</SheetTitle>
          <SheetDescription>
            Agrega una nueva célula de estudio para organizar a los estudiantes por curso.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la célula</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Célula A, Grupo 1, etc."
              required
              disabled={creating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Curso</Label>
            {loadingCourses ? (
              <div className="flex items-center justify-center p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Cargando cursos...</span>
              </div>
            ) : (
              <Select value={courseId} onValueChange={setCourseId} required disabled={creating}>
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
            )}
          </div>
        </form>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={creating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating || !name.trim() || !courseId || loadingCourses}
          >
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Célula"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}