
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type GetFoodItemsByDateInput } from '../schema';
import { getDailyCaloriesSummary } from '../handlers/get_daily_calories_summary';

// Test input
const testInput: GetFoodItemsByDateInput = {
  date: '2024-01-15'
};

describe('getDailyCaloriesSummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty summary for date with no food items', async () => {
    const result = await getDailyCaloriesSummary(testInput);

    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(0);
    expect(result.food_items).toHaveLength(0);
  });

  it('should return summary with food items for specific date', async () => {
    // Create test food items for the specific date
    const targetDate = new Date('2024-01-15T10:00:00.000Z');
    
    await db.insert(foodItemsTable)
      .values([
        { name: 'Apple', calories: 95, logged_at: targetDate },
        { name: 'Banana', calories: 105, logged_at: targetDate },
        { name: 'Orange', calories: 62, logged_at: targetDate }
      ])
      .execute();

    const result = await getDailyCaloriesSummary(testInput);

    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(262); // 95 + 105 + 62
    expect(result.food_items).toHaveLength(3);
    
    // Verify food items are included
    const itemNames = result.food_items.map(item => item.name);
    expect(itemNames).toContain('Apple');
    expect(itemNames).toContain('Banana');
    expect(itemNames).toContain('Orange');
  });

  it('should only include food items from the specified date', async () => {
    // Create food item for target date
    const targetDate = new Date('2024-01-15T10:00:00.000Z');
    await db.insert(foodItemsTable)
      .values({
        name: 'Apple',
        calories: 95,
        logged_at: targetDate
      })
      .execute();

    // Create food item for different date
    const differentDate = new Date('2024-01-16T10:00:00.000Z');
    await db.insert(foodItemsTable)
      .values({
        name: 'Banana',
        calories: 105,
        logged_at: differentDate
      })
      .execute();

    const result = await getDailyCaloriesSummary(testInput);

    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(95);
    expect(result.food_items).toHaveLength(1);
    expect(result.food_items[0].name).toEqual('Apple');
  });

  it('should handle food items logged at different times of the same day', async () => {
    // Create food items at different times during the target date
    const morningTime = new Date('2024-01-15T08:00:00.000Z');
    const afternoonTime = new Date('2024-01-15T14:30:00.000Z');
    const eveningTime = new Date('2024-01-15T20:45:00.000Z');

    await db.insert(foodItemsTable)
      .values([
        { name: 'Breakfast', calories: 300, logged_at: morningTime },
        { name: 'Lunch', calories: 450, logged_at: afternoonTime },
        { name: 'Dinner', calories: 600, logged_at: eveningTime }
      ])
      .execute();

    const result = await getDailyCaloriesSummary(testInput);

    expect(result.date).toEqual('2024-01-15');
    expect(result.total_calories).toEqual(1350); // 300 + 450 + 600
    expect(result.food_items).toHaveLength(3);

    // Verify all items are from the correct date
    result.food_items.forEach(item => {
      expect(item.logged_at).toBeInstanceOf(Date);
      const loggedDate = new Date(item.logged_at).toISOString().split('T')[0];
      expect(loggedDate).toEqual('2024-01-15');
    });
  });
});
