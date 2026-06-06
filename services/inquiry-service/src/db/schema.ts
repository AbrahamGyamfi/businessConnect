import { pgTable, text, timestamp, boolean, serial, integer } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  image: text('image'),
})

export const business = pgTable('business', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  email: text('email'),
})

export const inquiry = pgTable('inquiry', {
  id: serial('id').primaryKey(),
  businessId: integer('businessId').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  isRead: boolean('isRead').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
