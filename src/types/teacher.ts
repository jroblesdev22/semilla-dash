export interface TeacherCell {
  id: string
  name: string
  course_id: string
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

export interface Teacher {
  id: string
  name: string
  email: string | null
  whatsapp_phone: string | null
  cells: TeacherCell[]
}

export interface TeachersResponse {
  teachers: Teacher[]
}