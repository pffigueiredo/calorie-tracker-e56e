
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type GetFoodItemsByDateInput, type FoodItem } from '../schema';
import { and, gte, lt } from 'drizzle-orm';

export const getFoodItemsByDate = async (input: GetFoodItemsByDateInput): Promise<FoodItem[]> => {
  try {
    // Parse the input date and create date range for the entire day
    const startDate = new Date(input.date + 'T00:00:00.000Z');
    const endDate = new Date(input.date + 'T23:59:59.999Z');

    // Query food items for the specific date
    const results = await db.select()
      .from(foodItemsTable)
      .where(
        and(
          gte(foodItemsTable.logged_at, startDate),
          lt(foodItemsTable.logged_at, endDate)
        )
      )
      .orderBy(foodItemsTable.logged_at)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get food items by date:', error);
    throw error;
  }
};
