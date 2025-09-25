"use client"
import { useEffect, useState } from "react"
import { SignOutButton } from "@/components/SignOutButton"

interface Course {
  id: string
  name: string
  description?: string
  courseState: string
  creationTime: string
  updateTime: string
  enrollmentCode?: string
  courseGroupEmail?: string
  teacherGroupEmail?: string
  section?: string
  room?: string
}

interface CoursesResponse {
  courses: Course[]
  error?: string
}

export function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        const data: CoursesResponse = await response.json()
        
        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to fetch courses')
        }
        
        setCourses(data.courses || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="text-center">
        <p className="text-lg">Cargando cursos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <SignOutButton />
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Mis Cursos ({courses.length})</h2>
        <SignOutButton />
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No se encontraron cursos.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{course.name}</h3>
              
              {course.description && (
                <p className="text-gray-600 mb-3 text-sm line-clamp-3">{course.description}</p>
              )}
              
              <div className="space-y-1 text-sm text-gray-500">
                <p><span className="font-medium">Estado:</span> {course.courseState}</p>
                {course.section && (
                  <p><span className="font-medium">Sección:</span> {course.section}</p>
                )}
                {course.room && (
                  <p><span className="font-medium">Aula:</span> {course.room}</p>
                )}
                {course.enrollmentCode && (
                  <p><span className="font-medium">Código:</span> {course.enrollmentCode}</p>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Creado: {new Date(course.creationTime).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  Actualizado: {new Date(course.updateTime).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}