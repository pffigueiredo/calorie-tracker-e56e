
import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';

export const foodItemsTable = pgTable('food_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  logged_at: timestamp('logged_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type FoodItem = typeof foodItemsTable.$inferSelect; // For SELECT operations
export type NewFoodItem = typeof foodItemsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { foodItems: foodItemsTable };
