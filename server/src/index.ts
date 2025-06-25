
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { createFoodItemInputSchema, getFoodItemsByDateInputSchema } from './schema';
import { createFoodItem } from './handlers/create_food_item';
import { getFoodItemsByDate } from './handlers/get_food_items_by_date';
import { getDailyCaloriesSummary } from './handlers/get_daily_calories_summary';
import { getTodaySummary } from './handlers/get_today_summary';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new food item log entry
  createFoodItem: publicProcedure
    .input(createFoodItemInputSchema)
    .mutation(({ input }) => createFoodItem(input)),
  
  // Get all food items for a specific date
  getFoodItemsByDate: publicProcedure
    .input(getFoodItemsByDateInputSchema)
    .query(({ input }) => getFoodItemsByDate(input)),
  
  // Get daily calories summary for a specific date
  getDailyCaloriesSummary: publicProcedure
    .input(getFoodItemsByDateInputSchema)
    .query(({ input }) => getDailyCaloriesSummary(input)),
  
  // Get today's calories summary (convenience endpoint)
  getTodaySummary: publicProcedure
    .query(() => getTodaySummary()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
