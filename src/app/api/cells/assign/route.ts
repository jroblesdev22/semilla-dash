import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const { user_id, cell_id } = await request.json()

    // Validar datos requeridos
    if (!user_id || !cell_id) {
      return NextResponse.json(
        { error: "user_id and cell_id are required" },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { id: user_id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verificar que la célula existe
    const cell = await db.cell.findUnique({
      where: { id: cell_id },
      include: {
        course: true
      }
    })

    if (!cell) {
      return NextResponse.json(
        { error: "Cell not found" },
        { status: 404 }
      )
    }

    // Verificar si ya está asignado a esta célula
    const existingMembership = await db.cellMember.findUnique({
      where: {
        cell_id_user_id: {
          cell_id: cell_id,
          user_id: user_id
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already assigned to this cell" },
        { status: 400 }
      )
    }

    // Crear la asignación
    const cellMember = await db.cellMember.create({
      data: {
        id: randomUUID(),
        cell_id: cell_id,
        user_id: user_id,
        joined_at: new Date()
      }
    })

    return NextResponse.json({
      message: `Usuario asignado exitosamente a la célula ${cell.name}`,
      cellMember
    })
  } catch (error) {
    console.error('Error assigning user to cell:', error)
    return NextResponse.json(
      { error: "Failed to assign user to cell" },
      { status: 500 }
    )
  }
}