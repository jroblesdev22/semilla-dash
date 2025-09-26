"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useStudents } from "@/hooks/use-students"
import { useTeachers } from "@/hooks/use-teachers"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { ListTeachers } from "@/components/list-teachers"

interface Course {
  id: string
  name: string
  color_hex: string
}

export default function Page() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>()
  const [selectedProfessor, setSelectedProfessor] = useState<string | undefined>()
  const [dbCourses, setDbCourses] = useState<Course[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const { students, courses, loading, error, refetch } = useStudents(selectedCourseId)
  const { teachers } = useTeachers()

  const fetchCoursesFromDB = async () => {
    setCoursesLoading(true)
    try {
      const response = await fetch('/api/courses')
      const data = await response.json()
      setDbCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setCoursesLoading(false)
    }
  }

  const syncCourses = async () => {
    setSyncLoading(true)
    try {
      const response = await fetch('/api/courses', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        console.log(data.message)
        await fetchCoursesFromDB() // Refresh courses list
      } else {
        console.error('Error syncing courses:', data.error)
      }
    } catch (error) {
      console.error('Error syncing courses:', error)
    } finally {
      setSyncLoading(false)
    }
  }

  // Fetch courses on component mount
  useEffect(() => {
    fetchCoursesFromDB()
  }, [])

  // Filter students by selected professor based on cell membership
  const filteredStudents = selectedProfessor 
    ? students.filter(student => {
        // Find the selected teacher in the database
        const selectedTeacher = teachers.find(t => t.id === selectedProfessor)
        if (!selectedTeacher) return false
        
        // Get all cells where this teacher is a member
        const teacherCells = selectedTeacher.cells || []
        
        // Check if the student is a member of any of the teacher's cells
        // Match by classroomUserId between student data and cell members
        return teacherCells.some(cell => 
          cell.members.some(member => 
            member.role === 'student' && 
            member.classroomUserId === student.classroomUserId
          )
        )
      })
    : students

  // Create professor list for selector from database teachers
  const professorsForFilter = teachers.map(teacher => ({
    id: teacher.id,
    name: teacher.name
  }))

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Cargando datos de estudiantes de Google Classroom...
                  </p>
                </div>
              ) : error ? (
                <div className="px-4 lg:px-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Error al cargar los datos: {error}</span>
                      <Button variant="outline" size="sm" onClick={refetch}>
                        Reintentar
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <DataTable
                  data={filteredStudents}
                  onRefresh={refetch}
                  courses={courses}
                  selectedCourseId={selectedCourseId}
                  onCourseChange={setSelectedCourseId}
                  professors={professorsForFilter}
                  selectedProfessor={selectedProfessor}
                  onProfessorChange={setSelectedProfessor}
                />
              )}

              <h2 className="px-4 lg:px-6 text-2xl font-bold">Listado de cursos</h2>
              {/* colocar cuadro de color junto a nombre del curso entonces iria [color] nombre del curso */}
              <div className="flex flex-row gap-2 px-4 lg:px-6">
                {coursesLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-base">Cargando cursos...</span>
                  </div>
                ) : (
                  <>
                    {dbCourses.map((course) => (
                      <div key={course.id} className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-sm"
                          style={{ backgroundColor: course.color_hex }}
                        />
                        <span className="text-base font-semibold">{course.name}</span>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncCourses}
                      disabled={syncLoading}
                    >
                      {syncLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      {syncLoading ? 'Sincronizando...' : 'Sincronizar Cursos'}
                    </Button>
                  </>
                )}
              </div>
              <ListTeachers />
            </div>

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
