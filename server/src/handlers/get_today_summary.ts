
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type DailyCaloriesSummary } from '../schema';
import { gte, lt, and } from 'drizzle-orm';

export const getTodaySummary = async (): Promise<DailyCaloriesSummary> => {
  try {
    // Get today's date range (start and end of day)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Query food items logged today
    const foodItems = await db.select()
      .from(foodItemsTable)
      .where(
        and(
          gte(foodItemsTable.logged_at, startOfDay),
          lt(foodItemsTable.logged_at, endOfDay)
        )
      )
      .execute();

    // Calculate total calories
    const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);

    // Format today's date as YYYY-MM-DD
    const todayString = today.toISOString().split('T')[0];

    return {
      date: todayString,
      total_calories: totalCalories,
      food_items: foodItems
    };
  } catch (error) {
    console.error('Failed to get today summary:', error);
    throw error;
  }
};
