import { pgTable, text, timestamp, serial, integer } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image'),
})

export const review = pgTable('review', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  businessId: integer('businessId').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
