import { auth } from "@/auth"
import { google } from "googleapis"
import { NextResponse } from "next/server"

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

    let students: StudentStats[] = []
    let courses: any[] = []

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
      // Get all courses first
      const coursesResult = await classroom.courses.list({
        pageSize: 50,
      })
      courses = coursesResult.data.courses || []

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

    return NextResponse.json({ 
      students,
      courses: courseId ? [] : courses
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
  classroom: any, 
  courseId: string, 
  student: any,
  courseName: string
): Promise<StudentStats> {
  try {
    // Get student submissions for the course
    const submissions = await classroom.courses.courseWork.studentSubmissions.list({
      courseId: courseId,
      userId: student.userId,
      pageSize: 100,
    })

    const studentSubmissions = submissions.data.studentSubmissions || []

    // Get all course work for this course to compare
    const courseWork = await classroom.courses.courseWork.list({
      courseId: courseId,
      pageSize: 100,
    })

    const allAssignments = courseWork.data.courseWork || []
    const totalAssignments = allAssignments.length

    // Calculate statistics
    let tareasEntregadas = 0
    let tareasAtrasadas = 0 
    let tareasReentrega = 0
    let tareasFaltantes = 0

    // Create a map of submissions by course work ID
    const submissionMap = new Map()
    studentSubmissions.forEach((submission: any) => {
      if (submission.courseWorkId) {
        submissionMap.set(submission.courseWorkId, submission)
      }
    })

    // Analyze each assignment
    for (const assignment of allAssignments) {
      const submission = submissionMap.get(assignment.id)
      
      if (!submission) {
        // No submission found - missing assignment
        tareasFaltantes++
      } else {
        const state = submission.state
        const assignmentState = submission.assignmentSubmission?.state
        
        switch (state) {
          case 'TURNED_IN':
            tareasEntregadas++
            
            // Check if it was late
            if (assignment.dueDate && submission.updateTime) {
              const dueDate = new Date(
                assignment.dueDate.year,
                assignment.dueDate.month - 1,
                assignment.dueDate.day
              )
              
              if (assignment.dueTime) {
                dueDate.setHours(assignment.dueTime.hours || 23)
                dueDate.setMinutes(assignment.dueTime.minutes || 59)
              }
              
              const submissionDate = new Date(submission.updateTime)
              
              if (submissionDate > dueDate) {
                tareasAtrasadas++
              }
            }
            break
            
          case 'RETURNED':
            // Check if it needs resubmission
            if (assignmentState === 'CREATED' || assignmentState === 'STUDENT_EDITED_AFTER_TURN_IN') {
              tareasReentrega++
            } else {
              tareasEntregadas++
            }
            break
            
          case 'RECLAIMED_BY_STUDENT':
            // Student took back the submission, count as missing for now
            tareasFaltantes++
            break
            
          default:
            // NEW, CREATED states - not submitted yet
            tareasFaltantes++
            break
        }
      }
    }

    return {
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
  } catch (error) {
    console.error(`Error getting stats for student ${student.userId}:`, error)
    
    // Return default stats in case of error
    return {
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
  }
}
