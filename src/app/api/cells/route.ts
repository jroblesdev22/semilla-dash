import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"
import type { Prisma } from '@prisma/client'

// Type for cell with included relations
type CellWithRelations = Prisma.CellGetPayload<{
  include: {
    course: true,
    cell_members: {
      include: {
        user: true
      }
    }
  }
}>

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

    const cellsWithMembers = cells.map((cell: CellWithRelations) => ({
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
      members: cell.cell_members.map((member) => ({
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
    const { name, course_id, user_id, assign_user = false } = await request.json()

    // Validar datos requeridos
    if (!name || !course_id) {
      return NextResponse.json(
        { error: "Name and course_id are required" },
        { status: 400 }
      )
    }

    // Si se va a asignar un usuario, verificar que existe
    if (assign_user && user_id) {
      const user = await db.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
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
      }
    })

    // Si se especifica asignar usuario, crear la relación
    if (assign_user && user_id) {
      await db.cellMember.create({
        data: {
          id: randomUUID(),
          cell_id: newCell.id,
          user_id: user_id,
          joined_at: new Date()
        }
      })
    }

    // Obtener la célula completa con relaciones
    const cellWithMembers = await db.cell.findUnique({
      where: { id: newCell.id },
      include: {
        course: true,
        cell_members: {
          include: {
            user: true
          }
        }
      }
    })

    const formattedCell = {
      id: cellWithMembers!.id,
      name: cellWithMembers!.name,
      course_id: cellWithMembers!.course_id,
      created_at: cellWithMembers!.created_at,
      updated_at: cellWithMembers!.updated_at,
      course: {
        id: cellWithMembers!.course.id,
        name: cellWithMembers!.course.name,
        color_hex: cellWithMembers!.course.color_hex
      },
      members: cellWithMembers!.cell_members.map((member) => ({
        id: member.user.id,
        name: member.user.name || 'Sin nombre',
        email: member.user.email,
        role: member.user.role,
        joined_at: member.joined_at
      }))
    }

    return NextResponse.json({
      message: assign_user ? "Célula creada y usuario asignado exitosamente" : "Célula creada exitosamente",
      cell: formattedCell
    })
  } catch (error) {
    console.error('Error creating cell:', error)
    return NextResponse.json(
      { error: "Failed to create cell" },
      { status: 500 }
    )
  }
}