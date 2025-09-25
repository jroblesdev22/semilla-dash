import { auth } from "@/auth"
import { google } from "googleapis"
import { NextResponse } from "next/server"
import type { classroom_v1 } from "googleapis"

interface StudentStats {
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

    // Calculate statistics
    let tareasEntregadas = 0
    let tareasAtrasadas = 0 
    let tareasReentrega = 0
    let tareasFaltantes = 0

    // Create a map of submissions by courseWorkId for easy lookup
    const submissionMap = new Map()
    studentSubmissions.forEach((submission: classroom_v1.Schema$StudentSubmission) => {
      if (submission.courseWorkId) {
        submissionMap.set(submission.courseWorkId, submission)
      }
    })
    
    // Now analyze submissions using the more efficient approach
    studentSubmissions.forEach((submission: classroom_v1.Schema$StudentSubmission) => {
      const state = submission.state
      const isLate = submission.late
      
      switch (state) {
        case 'TURNED_IN':
          tareasEntregadas++
          
          // Check if it was late using the 'late' property from the API
          if (isLate) {
            tareasAtrasadas++
          }
          break
          
        case 'RETURNED':
          // Treat RETURNED submissions as completed
          tareasEntregadas++
          break
          
        case 'RECLAIMED_BY_STUDENT':
          // Student took back the submission, count as missing
          tareasFaltantes++
          break
          
        case 'NEW':
          // Never accessed by student - missing
          tareasFaltantes++
          break
          
        case 'CREATED':
          // Created but not submitted - missing
          tareasFaltantes++
          break
          
        default:
          // Any other state - count as missing for safety
          tareasFaltantes++
          break
      }
    })
    
    // Calculate assignments that have no submission at all
    const assignmentsWithSubmissions = new Set(studentSubmissions.map(s => s.courseWorkId))
    const assignmentsWithoutSubmissions = allAssignments.filter(a => a.id && !assignmentsWithSubmissions.has(a.id))
    
    // Add missing assignments to tareasFaltantes
    const missingCount = assignmentsWithoutSubmissions.length
    tareasFaltantes += missingCount

    const result = {
      id: `${student.userId || 'unknown'}-${courseId}`, // ID único combinando student y course
      name: student.profile?.name?.fullName || 'Unknown Student',
      email: student.profile?.emailAddress || '',
      courseId: courseId,
      courseName: courseName,
      tareasEntregadas,
      tareasAtrasadas,
      tareasFaltantes,
      tareasReentrega
    }    
    return result
  } catch (error) {
    
    // Return default stats in case of error
    const errorResult = {
      id: `${student.userId || 'unknown'}-${courseId}`, // ID único combinando student y course
      name: student.profile?.name?.fullName || 'Unknown Student',
      email: student.profile?.emailAddress || '',
      courseId: courseId,
      courseName: courseName,
      tareasEntregadas: 0,
      tareasAtrasadas: 0,
      tareasFaltantes: 0,
      tareasReentrega: 0
    }
    
    return errorResult
  }
}
