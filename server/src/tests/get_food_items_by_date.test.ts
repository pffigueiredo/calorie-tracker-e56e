
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type GetFoodItemsByDateInput } from '../schema';
import { getFoodItemsByDate } from '../handlers/get_food_items_by_date';

const testInput: GetFoodItemsByDateInput = {
  date: '2024-01-15'
};

describe('getFoodItemsByDate', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return food items for the specified date', async () => {
    // Create test food items for the target date
    await db.insert(foodItemsTable)
      .values([
        {
          name: 'Apple',
          calories: 95,
          logged_at: new Date('2024-01-15T08:00:00.000Z')
        },
        {
          name: 'Banana',
          calories: 105,
          logged_at: new Date('2024-01-15T12:30:00.000Z')
        }
      ])
      .execute();

    // Create food item for different date (should not be returned)
    await db.insert(foodItemsTable)
      .values({
        name: 'Orange',
        calories: 60,
        logged_at: new Date('2024-01-16T08:00:00.000Z')
      })
      .execute();

    const result = await getFoodItemsByDate(testInput);

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Apple');
    expect(result[0].calories).toEqual(95);
    expect(result[1].name).toEqual('Banana');
    expect(result[1].calories).toEqual(105);
    
    // Verify dates are within the target day
    result.forEach(item => {
      expect(item.logged_at).toBeInstanceOf(Date);
      expect(item.logged_at.toISOString().startsWith('2024-01-15')).toBe(true);
    });
  });

  it('should return empty array when no food items exist for the date', async () => {
    // Create food item for different date
    await db.insert(foodItemsTable)
      .values({
        name: 'Orange',
        calories: 60,
        logged_at: new Date('2024-01-16T08:00:00.000Z')
      })
      .execute();

    const result = await getFoodItemsByDate(testInput);

    expect(result).toHaveLength(0);
  });

  it('should return items ordered by logged_at time', async () => {
    // Create test food items with different times (inserted in different order)
    await db.insert(foodItemsTable)
      .values([
        {
          name: 'Dinner',
          calories: 500,
          logged_at: new Date('2024-01-15T19:00:00.000Z')
        },
        {
          name: 'Breakfast',
          calories: 300,
          logged_at: new Date('2024-01-15T07:00:00.000Z')
        },
        {
          name: 'Lunch',
          calories: 400,
          logged_at: new Date('2024-01-15T12:00:00.000Z')
        }
      ])
      .execute();

    const result = await getFoodItemsByDate(testInput);

    expect(result).toHaveLength(3);
    // Should be ordered by time: breakfast, lunch, dinner
    expect(result[0].name).toEqual('Breakfast');
    expect(result[1].name).toEqual('Lunch');
    expect(result[2].name).toEqual('Dinner');
  });

  it('should handle edge cases with times at day boundaries', async () => {
    // Create items at the very start and end of the day
    await db.insert(foodItemsTable)
      .values([
        {
          name: 'Midnight Snack',
          calories: 100,
          logged_at: new Date('2024-01-15T00:00:00.000Z')
        },
        {
          name: 'Late Night',
          calories: 150,
          logged_at: new Date('2024-01-15T23:59:59.000Z')
        },
        {
          name: 'Next Day',
          calories: 200,
          logged_at: new Date('2024-01-16T00:00:00.000Z')
        }
      ])
      .execute();

    const result = await getFoodItemsByDate(testInput);

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Midnight Snack');
    expect(result[1].name).toEqual('Late Night');
    
    // Verify the next day item is not included
    const nextDayIncluded = result.some(item => item.name === 'Next Day');
    expect(nextDayIncluded).toBe(false);
  });
});
