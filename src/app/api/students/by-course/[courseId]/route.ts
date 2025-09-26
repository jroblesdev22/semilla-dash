import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Get all users with student role that are NOT already assigned to any cell in this course
    const studentsNotInCells = await db.user.findMany({
      where: {
        role: "student",
        NOT: {
          cell_members: {
            some: {
              cell: {
                course_id: courseId
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedStudents = studentsNotInCells.map(student => ({
      id: student.id,
      name: student.name || 'Sin nombre',
      email: student.email,
      role: student.role
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