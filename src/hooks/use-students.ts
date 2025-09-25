import { useState, useEffect } from 'react'

interface StudentData {
  id: string
  name: string
  email: string
  courseId: string
  courseName: string
  tareasEntregadas: number
  tareasAtrasadas: number
  tareasFaltantes: number
  tareasReentrega: number
}

interface UseStudentsReturn {
  students: StudentData[]
  courses: any[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useStudents(courseId?: string): UseStudentsReturn {
  const [students, setStudents] = useState<StudentData[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = courseId 
        ? `/api/students?courseId=${encodeURIComponent(courseId)}`
        : '/api/students'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setStudents(data.students || [])
      setCourses(data.courses || [])
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setStudents([])
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [courseId])

  const refetch = () => {
    fetchStudents()
  }

  return {
    students,
    courses,
    loading,
    error,
    refetch
  }
}
