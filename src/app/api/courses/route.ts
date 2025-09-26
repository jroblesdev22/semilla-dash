import { auth } from "@/auth"
import { google } from "googleapis"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

const COURSE_COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
]

export async function GET() {
  try {
    // Get courses from database
    const dbCourses = await db.course.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ courses: dbCourses })
  } catch (error) {
    console.error('Error fetching courses from database:', error)
    return NextResponse.json(
      { error: "Failed to fetch courses", courses: [] },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await auth()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "No access token found" },
        { status: 401 }
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

    // Get courses from Google Classroom
    const result = await classroom.courses.list({
      pageSize: 50,
    })

    const classroomCourses = result.data.courses || []

    // Get existing courses from database
    const existingCourses = await db.course.findMany()
    const existingClassroomIds = new Set(
      existingCourses
        .filter(course => course.classroomId)
        .map(course => course.classroomId)
    )

    // Filter out courses that already exist in database
    const newCourses = classroomCourses.filter(
      course => course.id && !existingClassroomIds.has(course.id)
    )

    // Create new courses in database with unique colors
    const createdCourses = []
    const usedColors = new Set(existingCourses.map(course => course.color_hex))

    for (let i = 0; i < newCourses.length; i++) {
      const course = newCourses[i]

      // Find an unused color
      let color = COURSE_COLORS.find(c => !usedColors.has(c))
      if (!color) {
        // If all colors are used, cycle through them
        color = COURSE_COLORS[i % COURSE_COLORS.length]
      }
      usedColors.add(color)

      const createdCourse = await db.course.create({
        data: {
          id: randomUUID(),
          name: course.name || 'Curso sin nombre',
          description: course.description || null,
          classroomId: course.id!,
          color_hex: color,
          ownerId: session.user?.email || 'unknown'
        }
      })

      createdCourses.push(createdCourse)
    }

    return NextResponse.json({
      message: `${createdCourses.length} cursos sincronizados correctamente`,
      syncedCourses: createdCourses.length,
      totalCourses: classroomCourses.length
    })
  } catch (error) {
    console.error('Error syncing courses:', error)
    return NextResponse.json(
      { error: "Failed to sync courses" },
      { status: 500 }
    )
  }
}