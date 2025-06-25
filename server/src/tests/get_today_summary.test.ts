
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { getTodaySummary } from '../handlers/get_today_summary';

describe('getTodaySummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty summary when no food items logged today', async () => {
    const result = await getTodaySummary();

    const today = new Date().toISOString().split('T')[0];
    expect(result.date).toEqual(today);
    expect(result.total_calories).toEqual(0);
    expect(result.food_items).toHaveLength(0);
  });

  it('should return summary with food items logged today', async () => {
    // Create food items for today
    await db.insert(foodItemsTable)
      .values([
        { name: 'Apple', calories: 95 },
        { name: 'Banana', calories: 105 },
        { name: 'Orange', calories: 80 }
      ])
      .execute();

    const result = await getTodaySummary();

    const today = new Date().toISOString().split('T')[0];
    expect(result.date).toEqual(today);
    expect(result.total_calories).toEqual(280);
    expect(result.food_items).toHaveLength(3);
    
    // Verify food items are included
    const foodNames = result.food_items.map(item => item.name);
    expect(foodNames).toContain('Apple');
    expect(foodNames).toContain('Banana');
    expect(foodNames).toContain('Orange');
  });

  it('should only include food items from today', async () => {
    // Create food item for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await db.insert(foodItemsTable)
      .values([
        { name: 'Yesterday Snack', calories: 150, logged_at: yesterday },
        { name: 'Today Breakfast', calories: 300 }
      ])
      .execute();

    const result = await getTodaySummary();

    expect(result.total_calories).toEqual(300);
    expect(result.food_items).toHaveLength(1);
    expect(result.food_items[0].name).toEqual('Today Breakfast');
  });

  it('should handle multiple food items with correct calorie calculation', async () => {
    await db.insert(foodItemsTable)
      .values([
        { name: 'Breakfast', calories: 400 },
        { name: 'Lunch', calories: 650 },
        { name: 'Dinner', calories: 800 },
        { name: 'Snack', calories: 150 }
      ])
      .execute();

    const result = await getTodaySummary();

    expect(result.total_calories).toEqual(2000);
    expect(result.food_items).toHaveLength(4);
    
    // Verify all food items have proper structure
    result.food_items.forEach(item => {
      expect(item.id).toBeDefined();
      expect(typeof item.name).toBe('string');
      expect(typeof item.calories).toBe('number');
      expect(item.logged_at).toBeInstanceOf(Date);
    });
  });
});
