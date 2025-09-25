"use client"

import * as React from "react"
import { useStudents } from "@/hooks/use-students"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CourseSelectorProps {
  selectedCourseId?: string
  onCourseChange: (courseId: string | undefined) => void
}

export function CourseSelector({ selectedCourseId, onCourseChange }: CourseSelectorProps) {
  const { courses, loading } = useStudents()

  if (loading || courses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtrar por Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedCourseId || "ALL"} onValueChange={(value) => onCourseChange(value === "ALL" ? undefined : value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar curso (mostrar todos)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los cursos</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{course.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {course.courseState}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
