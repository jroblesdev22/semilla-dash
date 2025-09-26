import { Cell } from '@/types/cell'

// Use the same Cell type to avoid conflicts
export type TeacherCell = Cell

export interface Teacher {
  id: string
  name: string
  email: string | null
  classroomUserId: string | null
  whatsapp_phone: string | null
  cells: TeacherCell[]
}

export interface TeachersResponse {
  teachers: Teacher[]
}