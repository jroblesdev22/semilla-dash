import { auth } from "@/auth"
import { google } from "googleapis"
import { NextResponse } from "next/server"
import type { classroom_v1 } from "googleapis"

interface TeacherInfo {
  id: string
  name: string
  email: string
}

// Cache para profesores por curso para evitar múltiples llamadas
const teacherCache = new Map<string, TeacherInfo | null>()

async function getCourseTeacher(
  classroom: classroom_v1.Classroom,
  courseId: string
): Promise<TeacherInfo | null> {
  // Check cache first
  if (teacherCache.has(courseId)) {
    return teacherCache.get(courseId) || null
  }

  try {
    const teachersResponse = await classroom.courses.teachers.list({
      courseId: courseId
    })

    const teachers = teachersResponse.data.teachers || []
    
    // Get the first teacher (usually the course owner)
    if (teachers.length > 0 && teachers[0].profile) {
      const teacher = teachers[0]
      const profile = teacher.profile!
      const teacherInfo: TeacherInfo = {
        id: profile.id || '',
        name: profile.name?.fullName || 'Sin nombre',
        email: profile.emailAddress || ''
      }
      
      // Cache the result
      teacherCache.set(courseId, teacherInfo)
      return teacherInfo
    }
    
    // Cache null result to avoid repeated API calls
    teacherCache.set(courseId, null)
    return null
  } catch (error) {
    console.error(`Error getting teacher for course ${courseId}:`, error)
    // Cache null result to avoid repeated API calls
    teacherCache.set(courseId, null)
    return null
  }
}

interface StudentStats {
  id: string
  name: string
  email: string
  courseId: string
  courseName: string
  teacherId?: string
  teacherName?: string
  teacherEmail?: string
  asignada: number
  entregada: number
  entregadaConRetraso: number
  sinEntregar: number
  devueltaCalificada: number
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No access token found" }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    // Configure OAuth2 client with the access token
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken
    })

    // Create Classroom API client
    const classroom = google.classroom({
      version: 'v1',
      auth: oauth2Client
    })

    const students: StudentStats[] = []
    
    // Always get all courses first
    const coursesResult = await classroom.courses.list({
      pageSize: 50,
    })
    const courses = coursesResult.data.courses || []

    if (courseId) {
      // Get students for specific course
      const courseStudents = await classroom.courses.students.list({
        courseId: courseId,
      })

      if (courseStudents.data.students) {
        // Get course details
        const course = await classroom.courses.get({ id: courseId })
        
        for (const student of courseStudents.data.students) {
          const studentStats = await getStudentStats(classroom, courseId, student, course.data.name || '')
          students.push(studentStats)
        }
      }
    } else {
      // Get students for all courses
      for (const course of courses) {
        if (course.id) {
          try {
            const courseStudents = await classroom.courses.students.list({
              courseId: course.id,
            })

            if (courseStudents.data.students) {
              for (const student of courseStudents.data.students) {
                const studentStats = await getStudentStats(classroom, course.id, student, course.name || '')
                students.push(studentStats)
              }
            }
          } catch (error) {
            console.error(`Error getting students for course ${course.id}:`, error)
            // Continue with other courses
          }
        }
      }
    }

    // Map courses to include only the properties we need
    const mappedCourses = courses.map(course => ({
      id: course.id || '',
      name: course.name || '',
      courseState: course.courseState || 'UNKNOWN'
    }))

    return NextResponse.json({ 
      students,
      courses: mappedCourses
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: "Failed to fetch students", students: [] },
      { status: 500 }
    )
  }
}

async function getStudentStats(
  classroom: classroom_v1.Classroom, 
  courseId: string, 
  student: classroom_v1.Schema$Student,
  courseName: string
): Promise<StudentStats> {
  try {    
    // Get teacher information for this course
    const teacherInfo = await getCourseTeacher(classroom, courseId)
    
    // Get student submissions for the course - need to handle userId properly
    if (!student.userId) {
      console.error('Student userId is missing for student:', student)
      throw new Error('Student userId is missing')
    }
    
    // Obtiene todas las entregas del estudiante para el curso completo
    const submissions = await classroom.courses.courseWork.studentSubmissions.list({
      courseId: courseId,
      courseWorkId: '-',  // Usar guión para obtener de todas las tareas
      userId: student.userId,
      pageSize: 100,
    })

    const studentSubmissions = submissions.data.studentSubmissions || []

    // Get all course work for this course to compare with submissions
    const courseWork = await classroom.courses.courseWork.list({
      courseId: courseId,
      pageSize: 100,
    })

    const allAssignments = courseWork.data.courseWork || []

    // Calculate statistics based on Google Classroom states
    let asignada = 0               // NEW o CREATED dentro del plazo
    let entregada = 0              // TURNED_IN con late = false
    let entregadaConRetraso = 0    // TURNED_IN con late = true
    let sinEntregar = 0            // NEW o CREATED fuera del plazo
    let devueltaCalificada = 0     // RETURNED

    // Create a map of submissions by courseWorkId for easy lookup
    const submissionMap = new Map()
    studentSubmissions.forEach((submission: classroom_v1.Schema$StudentSubmission) => {
      if (submission.courseWorkId) {
        submissionMap.set(submission.courseWorkId, submission)
      }
    })
    
    // Create a map of assignments by ID for date checking
    const assignmentMap = new Map()
    allAssignments.forEach((assignment: classroom_v1.Schema$CourseWork) => {
      if (assignment.id) {
        assignmentMap.set(assignment.id, assignment)
      }
    })
    
    // Helper function to check if assignment is overdue
    const isOverdue = (assignment: classroom_v1.Schema$CourseWork): boolean => {
      if (!assignment.dueDate) return false // No due date = never overdue
      
      const currentDate = new Date()
      const dueDate = new Date(
        assignment.dueDate.year || currentDate.getFullYear(),
        (assignment.dueDate.month || 1) - 1, // months are 0-indexed
        assignment.dueDate.day || 1
      )
      
      // Add time if specified
      if (assignment.dueTime) {
        dueDate.setHours(assignment.dueTime.hours || 23)
        dueDate.setMinutes(assignment.dueTime.minutes || 59)
      } else {
        // If no time specified, set to end of day
        dueDate.setHours(23, 59, 59, 999)
      }
      
      return currentDate > dueDate
    }
    
    // Analyze submissions using the new categorization
    studentSubmissions.forEach((submission: classroom_v1.Schema$StudentSubmission) => {
      const state = submission.state
      const isLate = submission.late === true
      const assignment = assignmentMap.get(submission.courseWorkId)
      
      switch (state) {
        case 'NEW':
        case 'CREATED':
          // Check if assignment is overdue
          if (assignment && isOverdue(assignment)) {
            sinEntregar++  // Sin entregar - venció el plazo
          } else {
            asignada++     // Asignada - aún en plazo
          }
          break
          
        case 'TURNED_IN':
          if (isLate) {
            entregadaConRetraso++  // Entregada con retraso
          } else {
            entregada++            // Entregada a tiempo
          }
          break
          
        case 'RETURNED':
          devueltaCalificada++     // Devuelta (calificada)
          break
          
        case 'RECLAIMED_BY_STUDENT':
          // Student reclaimed - treat as asignada if not overdue, otherwise sin entregar
          if (assignment && isOverdue(assignment)) {
            sinEntregar++
          } else {
            asignada++
          }
          break
          
        default:
          // Any other state - count as asignada for safety
          asignada++
          break
      }
    })
    
    // Calculate assignments that have no submission at all
    const assignmentsWithSubmissions = new Set(studentSubmissions.map(s => s.courseWorkId))
    const assignmentsWithoutSubmissions = allAssignments.filter(a => a.id && !assignmentsWithSubmissions.has(a.id))
    
    // For assignments without submissions, check if they're overdue
    assignmentsWithoutSubmissions.forEach((assignment: classroom_v1.Schema$CourseWork) => {
      if (isOverdue(assignment)) {
        sinEntregar++  // Sin entregar - venció el plazo sin hacer nada
      } else {
        asignada++     // Asignada - aún en plazo
      }
    })

    const result = {
      id: `${student.userId || 'unknown'}-${courseId}`, // ID único combinando student y course
      name: student.profile?.name?.fullName || 'Unknown Student',
      email: student.profile?.emailAddress || '',
      courseId: courseId,
      courseName: courseName,
      teacherId: teacherInfo?.id,
      teacherName: teacherInfo?.name,
      teacherEmail: teacherInfo?.email,
      asignada,
      entregada,
      entregadaConRetraso,
      sinEntregar,
      devueltaCalificada
    }    
    return result
  } catch (error) {
    console.error('Error calculating student stats:', error)

    // Return default stats in case of error
    const errorResult = {
      id: `${student.userId || 'unknown'}-${courseId}`, // ID único combinando student y course
      name: student.profile?.name?.fullName || 'Unknown Student',
      email: student.profile?.emailAddress || '',
      courseId: courseId,
      courseName: courseName,
      teacherId: undefined,
      teacherName: undefined,
      teacherEmail: undefined,
      asignada: 0,
      entregada: 0,
      entregadaConRetraso: 0,
      sinEntregar: 0,
      devueltaCalificada: 0
    }
    
    return errorResult
  }
}
