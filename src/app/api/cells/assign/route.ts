import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const { user_id, classroomUserId, name, email, cell_id } = await request.json()
    
    // Debug logging
    console.log('POST /api/cells/assign - Received data:', { user_id, classroomUserId, name, email, cell_id })

    // Validate required cell_id first
    if (!cell_id) {
      return NextResponse.json(
        { error: "cell_id is required" },
        { status: 400 }
      )
    }

    // Support both old format (user_id) and new format (classroomUserId + user details)
    let user;
    let userId: string;

    if (user_id) {
      // Legacy format - user already exists in DB
      user = await db.user.findUnique({
        where: { id: user_id }
      })

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }
      userId = user_id;
    } else if (classroomUserId && name) {
      // New format - create or update user from Google Classroom data
      // Note: email can be empty string, so we don't require it to be truthy

      // Try to find existing user by classroomUserId
      user = await db.user.findUnique({
        where: { classroomUserId }
      })

      if (!user) {
        // Create new user with Google Classroom data
        const newUserId = randomUUID()
        user = await db.user.create({
          data: {
            id: newUserId,
            name,
            email,
            classroomUserId,
            role: "student"
          }
        })
        userId = newUserId
      } else {
        // Update existing user data (in case it changed in Google Classroom)
        user = await db.user.update({
          where: { classroomUserId },
          data: {
            name,
            email
          }
        })
        userId = user.id
      }
    } else {
      return NextResponse.json(
        { error: "Either user_id or (classroomUserId and name) are required" },
        { status: 400 }
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
          user_id: userId
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
        user_id: userId,
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