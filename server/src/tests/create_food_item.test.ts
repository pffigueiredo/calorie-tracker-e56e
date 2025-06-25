
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foodItemsTable } from '../db/schema';
import { type CreateFoodItemInput } from '../schema';
import { createFoodItem } from '../handlers/create_food_item';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateFoodItemInput = {
  name: 'Apple',
  calories: 95
};

describe('createFoodItem', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a food item', async () => {
    const result = await createFoodItem(testInput);

    // Basic field validation
    expect(result.name).toEqual('Apple');
    expect(result.calories).toEqual(95);
    expect(result.id).toBeDefined();
    expect(result.logged_at).toBeInstanceOf(Date);
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
  });

  it('should save food item to database', async () => {
    const result = await createFoodItem(testInput);

    // Query using proper drizzle syntax
    const foodItems = await db.select()
      .from(foodItemsTable)
      .where(eq(foodItemsTable.id, result.id))
      .execute();

    expect(foodItems).toHaveLength(1);
    expect(foodItems[0].name).toEqual('Apple');
    expect(foodItems[0].calories).toEqual(95);
    expect(foodItems[0].logged_at).toBeInstanceOf(Date);
  });

  it('should set logged_at to current time', async () => {
    const beforeCreate = new Date();
    const result = await createFoodItem(testInput);
    const afterCreate = new Date();

    expect(result.logged_at).toBeInstanceOf(Date);
    expect(result.logged_at >= beforeCreate).toBe(true);
    expect(result.logged_at <= afterCreate).toBe(true);
  });

  it('should handle different food items', async () => {
    const bananaInput: CreateFoodItemInput = {
      name: 'Banana',
      calories: 105
    };

    const result = await createFoodItem(bananaInput);

    expect(result.name).toEqual('Banana');
    expect(result.calories).toEqual(105);
    expect(result.id).toBeDefined();
    expect(result.logged_at).toBeInstanceOf(Date);
  });
});
