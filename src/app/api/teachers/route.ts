import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { google } from "googleapis"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    const teachers = await db.user.findMany({
      where: {
        role: "teacher"
      },
      include: {
        cell_members: {
          include: {
            cell: {
              include: {
                course: true,
                cell_members: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const teachersWithCells = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name || 'Sin nombre',
      email: teacher.email,
      classroomUserId: teacher.classroomUserId,
      whatsapp_phone: teacher.whatsapp_phone,
      cells: teacher.cell_members.map(member => ({
        id: member.cell.id,
        name: member.cell.name,
        course_id: member.cell.course_id,
        created_at: member.cell.created_at,
        updated_at: member.cell.updated_at,
        course: {
          id: member.cell.course.id,
          name: member.cell.course.name,
          color_hex: member.cell.course.color_hex
        },
        members: member.cell.cell_members.map(cellMember => ({
          id: cellMember.user.id,
          name: cellMember.user.name || 'Sin nombre',
          email: cellMember.user.email,
          classroomUserId: cellMember.user.classroomUserId,
          role: cellMember.user.role,
          joined_at: cellMember.joined_at
        }))
      }))
    }))

    return NextResponse.json({ teachers: teachersWithCells })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: "Failed to fetch teachers", teachers: [] },
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

    // Get all courses from database
    const courses = await db.course.findMany({
      where: {
        classroomId: {
          not: null
        }
      }
    })

    console.log(`Found ${courses.length} courses in database with classroomId`)
    courses.forEach(course => {
      console.log(`- Course: ${course.name} (ID: ${course.classroomId})`)
    })

    let syncedTeachers = 0
    let totalTeachers = 0
    const newTeachers = []


    // For each course, get teachers from Google Classroom
    for (const course of courses) {
      if (!course.classroomId) continue

      try {
        console.log(`\n=== Fetching teachers for course: ${course.name} (${course.classroomId}) ===`)

        // Get teachers from this course
        const teachersResponse = await classroom.courses.teachers.list({
          courseId: course.classroomId
        })

        console.log(`Raw teachers response:`, JSON.stringify(teachersResponse.data, null, 2))

        const classroomTeachers = teachersResponse.data.teachers || []
        console.log(`Found ${classroomTeachers.length} teachers in course ${course.name}`)

        classroomTeachers.forEach((teacher, index) => {
          console.log(`Teacher ${index + 1}:`, {
            id: teacher.profile?.id,
            name: teacher.profile?.name?.fullName,
            email: teacher.profile?.emailAddress,
            userId: teacher.userId
          })
        })

        totalTeachers += classroomTeachers.length

        for (const teacher of classroomTeachers) {
          console.log(`\n--- Processing teacher ---`)
          console.log(`Profile ID: ${teacher.profile?.id}`)
          console.log(`Email: ${teacher.profile?.emailAddress}`)
          console.log(`Full Name: ${teacher.profile?.name?.fullName}`)

          if (!teacher.profile?.id) {
            console.log(`❌ Skipping teacher - missing profile ID`)
            continue
          }

          // Check if teacher already exists in database
          const whereConditions: Array<{ classroomUserId?: string; email?: string }> = [
            { classroomUserId: teacher.profile.id }
          ]

          // Only add email condition if email is available
          if (teacher.profile.emailAddress) {
            whereConditions.push({ email: teacher.profile.emailAddress })
          }

          const existingTeacher = await db.user.findFirst({
            where: {
              OR: whereConditions
            }
          })

          console.log(`Existing teacher found:`, existingTeacher ? {
            id: existingTeacher.id,
            name: existingTeacher.name,
            email: existingTeacher.email,
            classroomUserId: existingTeacher.classroomUserId
          } : 'None')

          if (!existingTeacher) {
            console.log(`✅ Creating new teacher: ${teacher.profile.name?.fullName}`)

            // Create new teacher
            const newTeacher = await db.user.create({
              data: {
                id: randomUUID(),
                name: teacher.profile.name?.fullName || 'Sin nombre',
                email: teacher.profile.emailAddress || null,
                classroomUserId: teacher.profile.id,
                role: "teacher",
                emailVerified: teacher.profile.emailAddress ? new Date() : null
              }
            })

            console.log(`Created teacher:`, newTeacher)
            newTeachers.push(newTeacher)
            syncedTeachers++
          } else {
            console.log(`🔄 Updating existing user to teacher role: ${existingTeacher.name}`)

            // Update existing user to teacher role and add classroom ID if missing
            await db.user.update({
              where: { id: existingTeacher.id },
              data: {
                classroomUserId: teacher.profile.id,
                name: teacher.profile.name?.fullName || existingTeacher.name,
                role: "teacher"
              }
            })
            syncedTeachers++
          }
        }
      } catch (courseError) {
        console.error(`Error fetching teachers for course ${course.classroomId}:`, courseError)
        // Continue with next course
      }
    }

    console.log(`\n=== SYNC SUMMARY ===`)
    console.log(`Total courses processed: ${courses.length}`)
    console.log(`Total teachers found: ${totalTeachers}`)
    console.log(`New teachers created: ${newTeachers.length}`)
    console.log(`Teachers synced: ${syncedTeachers}`)

    return NextResponse.json({
      message: `${syncedTeachers} profesores sincronizados correctamente`,
      syncedTeachers,
      totalTeachers,
      newTeachers: newTeachers.length
    })
  } catch (error) {
    console.error('Error syncing teachers:', error)
    return NextResponse.json(
      { error: "Failed to sync teachers" },
      { status: 500 }
    )
  }
}