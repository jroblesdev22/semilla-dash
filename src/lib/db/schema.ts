import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Tabla de usuarios
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  // Numero de WhatsApp del usuario
  whatsappPhone: text('whatsapp_phone'),
}, (table) => [
  uniqueIndex('users_idx_users_email').on(table.email),
]);

// Tabla de cursos
export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  // Nombre del curso
  name: text('name').notNull(),
  // Color en formato hexadecimal
  colorHex: text('color_hex').notNull(),
});

// Tabla de celdas
export const cells = sqliteTable('cells', {
  id: text('id').primaryKey(),
  // Nombre de la celula
  name: text('name').notNull(),
  courseId: text('course_id').notNull().references(() => courses.id),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
}, (table) => [
  index('cells_idx_cells_course_id').on(table.courseId),
]);

// Tabla de miembros de celda
export const cellMembers = sqliteTable('cell_members', {
  id: text('id').primaryKey(),
  cellId: text('cell_id').notNull().references(() => cells.id),
  userId: text('user_id').notNull().references(() => users.id),
  // student o teacher
  role: text('role').notNull(),
  joinedAt: integer('joined_at', { mode: 'timestamp' }),
}, (table) => [
  index('cell_members_idx_cell_members_cell_id').on(table.cellId),
  index('cell_members_idx_cell_members_user_id').on(table.userId),
  index('cell_members_idx_cell_members_role').on(table.role),
  uniqueIndex('cell_members_idx_cell_members_cell_id_user_id').on(table.cellId, table.userId),
]);

// Tipos TypeScript inferidos
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type Cell = typeof cells.$inferSelect;
export type NewCell = typeof cells.$inferInsert;

export type CellMember = typeof cellMembers.$inferSelect;
export type NewCellMember = typeof cellMembers.$inferInsert;
