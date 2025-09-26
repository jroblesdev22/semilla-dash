import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    const cells = await db.cell.findMany({
      include: {
        course: true,
        cell_members: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    })

    const cellsWithMembers = cells.map(cell => ({
      id: cell.id,
      name: cell.name,
      course_id: cell.course_id,
      created_at: cell.created_at,
      updated_at: cell.updated_at,
      course: {
        id: cell.course.id,
        name: cell.course.name,
        color_hex: cell.course.color_hex
      },
      members: cell.cell_members.map(member => ({
        id: member.user.id,
        name: member.user.name || 'Sin nombre',
        email: member.user.email,
        role: member.user.role,
        joined_at: member.joined_at
      }))
    }))

    return NextResponse.json({ cells: cellsWithMembers })
  } catch (error) {
    console.error('Error fetching cells:', error)
    return NextResponse.json(
      { error: "Failed to fetch cells", cells: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, course_id } = await request.json()

    // Validar datos requeridos
    if (!name || !course_id) {
      return NextResponse.json(
        { error: "Name and course_id are required" },
        { status: 400 }
      )
    }

    // Verificar que el curso existe
    const course = await db.course.findUnique({
      where: { id: course_id }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Crear nueva célula
    const newCell = await db.cell.create({
      data: {
        id: randomUUID(),
        name: name.trim(),
        course_id: course_id,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        course: true,
        cell_members: {
          include: {
            user: true
          }
        }
      }
    })

    const cellWithMembers = {
      id: newCell.id,
      name: newCell.name,
      course_id: newCell.course_id,
      created_at: newCell.created_at,
      updated_at: newCell.updated_at,
      course: {
        id: newCell.course.id,
        name: newCell.course.name,
        color_hex: newCell.course.color_hex
      },
      members: newCell.cell_members.map(member => ({
        id: member.user.id,
        name: member.user.name || 'Sin nombre',
        email: member.user.email,
        role: member.user.role,
        joined_at: member.joined_at
      }))
    }

    return NextResponse.json({
      message: "Célula creada exitosamente",
      cell: cellWithMembers
    })
  } catch (error) {
    console.error('Error creating cell:', error)
    return NextResponse.json(
      { error: "Failed to create cell" },
      { status: 500 }
    )
  }
}