
import { z } from 'zod';

// Food item schema
export const foodItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  calories: z.number().int().nonnegative(),
  logged_at: z.coerce.date()
});

export type FoodItem = z.infer<typeof foodItemSchema>;

// Input schema for creating food items
export const createFoodItemInputSchema = z.object({
  name: z.string().min(1, "Food name is required"),
  calories: z.number().int().nonnegative()
});

export type CreateFoodItemInput = z.infer<typeof createFoodItemInputSchema>;

// Schema for getting food items by date
export const getFoodItemsByDateInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
});

export type GetFoodItemsByDateInput = z.infer<typeof getFoodItemsByDateInputSchema>;

// Schema for daily calories summary
export const dailyCaloriesSummarySchema = z.object({
  date: z.string(),
  total_calories: z.number().int().nonnegative(),
  food_items: z.array(foodItemSchema)
});

export type DailyCaloriesSummary = z.infer<typeof dailyCaloriesSummarySchema>;
