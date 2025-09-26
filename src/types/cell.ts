export interface Cell {
  id: string
  name: string
  course_id: string
  created_at: Date | null
  updated_at: Date | null
  course: {
    id: string
    name: string
    color_hex: string
  }
  members: CellMember[]
}

export interface CellMember {
  id: string
  name: string
  email: string | null
  role: string
  joined_at: Date | null
}

export interface CreateCellRequest {
  name: string
  course_id: string
  user_id?: string
  assign_user?: boolean
}

export interface AssignUserToCellRequest {
  user_id: string
  cell_id: string
}

export interface CellsResponse {
  cells: Cell[]
  error?: string
}

export interface CreateCellResponse {
  message: string
  cell: Cell
  error?: string
}

export interface AssignUserResponse {
  message: string
  cellMember: {
    id: string
    cell_id: string
    user_id: string
    joined_at: Date
  }
  error?: string
}