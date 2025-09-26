import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { google } from "googleapis"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params

    // Verify session and access token
    const session = await auth()
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No access token found" }, 
        { status: 401 }
      )
    }

    // Verify course exists in local DB
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

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

    // Get students from Google Classroom using the classroomId
    const courseStudents = await classroom.courses.students.list({
      courseId: course.classroomId || courseId,
    })

    if (!courseStudents.data.students) {
      return NextResponse.json({
        students: [],
        course: {
          id: course.id,
          name: course.name,
          color_hex: course.color_hex
        }
      })
    }

    // Get students that are already assigned to cells in this course (using classroomUserId)
    const assignedStudentIds = await db.user.findMany({
      where: {
        role: "student",
        classroomUserId: {
          not: null
        },
        cell_members: {
          some: {
            cell: {
              course_id: courseId
            }
          }
        }
      },
      select: {
        classroomUserId: true
      }
    })

    const assignedClassroomIds = new Set(
      assignedStudentIds
        .map(user => user.classroomUserId)
        .filter(id => id !== null) as string[]
    )

    // Filter out students that are already assigned to cells in this course
    const availableStudents = courseStudents.data.students.filter(student => 
      student.userId && !assignedClassroomIds.has(student.userId)
    )

    const formattedStudents = availableStudents.map(student => ({
      id: student.userId || '', // This is the Google Classroom user ID
      classroomUserId: student.userId || '',
      name: student.profile?.name?.fullName || 'Sin nombre',
      email: student.profile?.emailAddress || null, // Use null instead of empty string for optional email
      role: 'student'
    }))

    return NextResponse.json({
      students: formattedStudents,
      course: {
        id: course.id,
        name: course.name,
        color_hex: course.color_hex
      }
    })
  } catch (error) {
    console.error('Error fetching students by course:', error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}