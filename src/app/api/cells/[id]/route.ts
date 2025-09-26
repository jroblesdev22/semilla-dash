import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET single cell
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cell = await db.cell.findUnique({
      where: { id },
      include: {
        course: true,
        cell_members: {
          include: {
            user: true
          }
        }
      }
    })

    if (!cell) {
      return NextResponse.json(
        { error: "Cell not found" },
        { status: 404 }
      )
    }

    const cellWithMembers = {
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
    }

    return NextResponse.json({ cell: cellWithMembers })
  } catch (error) {
    console.error('Error fetching cell:', error)
    return NextResponse.json(
      { error: "Failed to fetch cell" },
      { status: 500 }
    )
  }
}

// PUT (update cell)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Verify cell exists
    const existingCell = await db.cell.findUnique({
      where: { id }
    })

    if (!existingCell) {
      return NextResponse.json(
        { error: "Cell not found" },
        { status: 404 }
      )
    }

    // Update cell
    const updatedCell = await db.cell.update({
      where: { id },
      data: {
        name: name.trim(),
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
      id: updatedCell.id,
      name: updatedCell.name,
      course_id: updatedCell.course_id,
      created_at: updatedCell.created_at,
      updated_at: updatedCell.updated_at,
      course: {
        id: updatedCell.course.id,
        name: updatedCell.course.name,
        color_hex: updatedCell.course.color_hex
      },
      members: updatedCell.cell_members.map(member => ({
        id: member.user.id,
        name: member.user.name || 'Sin nombre',
        email: member.user.email,
        role: member.user.role,
        joined_at: member.joined_at
      }))
    }

    return NextResponse.json({
      message: "Célula actualizada exitosamente",
      cell: cellWithMembers
    })
  } catch (error) {
    console.error('Error updating cell:', error)
    return NextResponse.json(
      { error: "Failed to update cell" },
      { status: 500 }
    )
  }
}

// DELETE cell
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify cell exists
    const existingCell = await db.cell.findUnique({
      where: { id },
      include: {
        cell_members: true
      }
    })

    if (!existingCell) {
      return NextResponse.json(
        { error: "Cell not found" },
        { status: 404 }
      )
    }

    // Delete all cell members first (due to foreign key constraints)
    await db.cellMember.deleteMany({
      where: { cell_id: id }
    })

    // Delete the cell
    await db.cell.delete({
      where: { id }
    })

    return NextResponse.json({
      message: `Célula "${existingCell.name}" eliminada exitosamente`
    })
  } catch (error) {
    console.error('Error deleting cell:', error)
    return NextResponse.json(
      { error: "Failed to delete cell" },
      { status: 500 }
    )
  }
}