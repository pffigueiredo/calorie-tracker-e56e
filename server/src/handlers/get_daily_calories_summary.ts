
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type GetFoodItemsByDateInput, type DailyCaloriesSummary } from '../schema';
import { gte, lt, and } from 'drizzle-orm';

export const getDailyCaloriesSummary = async (input: GetFoodItemsByDateInput): Promise<DailyCaloriesSummary> => {
  try {
    // Parse the input date and create date range for the entire day
    const startDate = new Date(input.date + 'T00:00:00.000Z');
    const endDate = new Date(input.date + 'T23:59:59.999Z');

    // Query food items for the specific date
    const foodItems = await db.select()
      .from(foodItemsTable)
      .where(
        and(
          gte(foodItemsTable.logged_at, startDate),
          lt(foodItemsTable.logged_at, endDate)
        )
      )
      .execute();

    // Calculate total calories
    const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);

    return {
      date: input.date,
      total_calories: totalCalories,
      food_items: foodItems
    };
  } catch (error) {
    console.error('Daily calories summary fetch failed:', error);
    throw error;
  }
};
