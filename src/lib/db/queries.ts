import { eq, and, desc, count } from 'drizzle-orm';
import { getDb, schema } from './index';

const db = getDb();

// Funciones para usuarios
export async function createUser(userData: {
  id: string;
  email?: string;
  name?: string;
  emailVerified?: Date;
  whatsappPhone?: string;
}) {
  return await db.insert(schema.users).values(userData).returning();
}

export async function getUserByEmail(email: string) {
  return await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
}

export async function getUserById(id: string) {
  return await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
}

export async function getAllUsers() {
  return await db.select().from(schema.users);
}

// Funciones para cursos
export async function createCourse(courseData: {
  id: string;
  name: string;
  colorHex: string;
}) {
  return await db.insert(schema.courses).values(courseData).returning();
}

export async function getAllCourses() {
  return await db.select().from(schema.courses);
}

export async function getCourseById(id: string) {
  return await db.select().from(schema.courses).where(eq(schema.courses.id, id)).limit(1);
}

// Funciones para celdas
export async function createCell(cellData: {
  id: string;
  name: string;
  courseId: string;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return await db.insert(schema.cells).values(cellData).returning();
}

export async function getCellsByCourse(courseId: string) {
  return await db.select().from(schema.cells).where(eq(schema.cells.courseId, courseId));
}

export async function getAllCells() {
  return await db.select().from(schema.cells);
}

export async function getCellById(id: string) {
  return await db.select().from(schema.cells).where(eq(schema.cells.id, id)).limit(1);
}

export async function updateCell(id: string, data: { name?: string; updatedAt?: Date }) {
  return await db.update(schema.cells).set(data).where(eq(schema.cells.id, id)).returning();
}

export async function deleteCell(id: string) {
  return await db.delete(schema.cells).where(eq(schema.cells.id, id)).returning();
}

// Funciones para miembros de celda
export async function createCellMember(memberData: {
  id: string;
  cellId: string;
  userId: string;
  role: 'student' | 'teacher';
  joinedAt?: Date;
}) {
  return await db.insert(schema.cellMembers).values(memberData).returning();
}

export async function getCellMembers(cellId: string) {
  return await db.select({
    id: schema.cellMembers.id,
    cellId: schema.cellMembers.cellId,
    userId: schema.cellMembers.userId,
    role: schema.cellMembers.role,
    joinedAt: schema.cellMembers.joinedAt,
    userName: schema.users.name,
    userEmail: schema.users.email,
    whatsappPhone: schema.users.whatsappPhone,
  })
  .from(schema.cellMembers)
  .leftJoin(schema.users, eq(schema.cellMembers.userId, schema.users.id))
  .where(eq(schema.cellMembers.cellId, cellId));
}

export async function getCellMembersByRole(cellId: string, role: 'student' | 'teacher') {
  return await db.select({
    id: schema.cellMembers.id,
    cellId: schema.cellMembers.cellId,
    userId: schema.cellMembers.userId,
    role: schema.cellMembers.role,
    joinedAt: schema.cellMembers.joinedAt,
    userName: schema.users.name,
    userEmail: schema.users.email,
    whatsappPhone: schema.users.whatsappPhone,
  })
  .from(schema.cellMembers)
  .leftJoin(schema.users, eq(schema.cellMembers.userId, schema.users.id))
  .where(and(
    eq(schema.cellMembers.cellId, cellId),
    eq(schema.cellMembers.role, role)
  ));
}

export async function getUserCells(userId: string) {
  return await db.select({
    id: schema.cells.id,
    name: schema.cells.name,
    courseId: schema.cells.courseId,
    createdAt: schema.cells.createdAt,
    updatedAt: schema.cells.updatedAt,
    role: schema.cellMembers.role,
    joinedAt: schema.cellMembers.joinedAt,
    courseName: schema.courses.name,
    courseColor: schema.courses.colorHex,
  })
  .from(schema.cellMembers)
  .leftJoin(schema.cells, eq(schema.cellMembers.cellId, schema.cells.id))
  .leftJoin(schema.courses, eq(schema.cells.courseId, schema.courses.id))
  .where(eq(schema.cellMembers.userId, userId));
}

export async function removeCellMember(cellId: string, userId: string) {
  return await db.delete(schema.cellMembers)
    .where(and(
      eq(schema.cellMembers.cellId, cellId),
      eq(schema.cellMembers.userId, userId)
    ))
    .returning();
}

export async function updateCellMemberRole(cellId: string, userId: string, role: 'student' | 'teacher') {
  return await db.update(schema.cellMembers)
    .set({ role })
    .where(and(
      eq(schema.cellMembers.cellId, cellId),
      eq(schema.cellMembers.userId, userId)
    ))
    .returning();
}

// Funciones combinadas para obtener información detallada
export async function getCellsWithMembersCount(courseId?: string) {
  const query = db.select({
    cellId: schema.cells.id,
    cellName: schema.cells.name,
    courseId: schema.cells.courseId,
    courseName: schema.courses.name,
    courseColor: schema.courses.colorHex,
    createdAt: schema.cells.createdAt,
    membersCount: count(schema.cellMembers.id),
  })
  .from(schema.cells)
  .leftJoin(schema.courses, eq(schema.cells.courseId, schema.courses.id))
  .leftJoin(schema.cellMembers, eq(schema.cells.id, schema.cellMembers.cellId))
  .groupBy(schema.cells.id);

  if (courseId) {
    return await query.where(eq(schema.cells.courseId, courseId));
  }

  return await query;
}
