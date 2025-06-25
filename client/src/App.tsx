
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { CreateFoodItemInput, DailyCaloriesSummary, FoodItem } from '../../server/src/schema';

function App() {
  const [summary, setSummary] = useState<DailyCaloriesSummary>({
    date: '',
    total_calories: 0,
    food_items: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding new food items
  const [formData, setFormData] = useState<CreateFoodItemInput>({
    name: '',
    calories: 0
  });

  // Load today's summary
  const loadTodaySummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await trpc.getTodaySummary.query();
      setSummary(result);
    } catch (error) {
      console.error('Failed to load today\'s summary:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodaySummary();
  }, [loadTodaySummary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.calories <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newFoodItem = await trpc.createFoodItem.mutate(formData);
      
      // Update the summary with the new food item
      setSummary((prev: DailyCaloriesSummary) => ({
        ...prev,
        total_calories: prev.total_calories + newFoodItem.calories,
        food_items: [...prev.food_items, newFoodItem]
      }));

      // Reset form
      setFormData({
        name: '',
        calories: 0
      });
    } catch (error) {
      console.error('Failed to log food item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍎 Calorie Tracker
          </h1>
          <p className="text-gray-600">
            Track your daily food intake and stay healthy!
          </p>
        </div>

        {/* Add Food Item Form */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <span>🍽️</span>
              Log New Food Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Food name (e.g., Apple, Chicken Breast)"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateFoodItemInput) => ({ 
                        ...prev, 
                        name: e.target.value 
                      }))
                    }
                    className="text-base"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Calories"
                    value={formData.calories || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateFoodItemInput) => ({ 
                        ...prev, 
                        calories: parseInt(e.target.value) || 0 
                      }))
                    }
                    min="1"
                    className="text-base"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.name.trim() || formData.calories <= 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? '📝 Logging...' : '➕ Log Food Item'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-blue-700">
              <span className="flex items-center gap-2">
                <span>📊</span>
                Today's Summary
              </span>
              {summary.date && (
                <span className="text-sm font-normal text-gray-600">
                  {formatDate(summary.date)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-gray-600">Loading your food log...</p>
              </div>
            ) : (
              <>
                {/* Total Calories */}
                <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
                  <div className="text-3xl font-bold text-gray-800 mb-1">
                    {summary.total_calories.toLocaleString()}
                  </div>
                  <div className="text-lg text-gray-600">
                    Total Calories Today 🔥
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Food Items List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span>🥗</span>
                    Logged Food Items ({summary.food_items.length})
                  </h3>
                  
                  {summary.food_items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-3">🍽️</div>
                      <p>No food items logged today yet.</p>
                      <p className="text-sm mt-1">Start tracking by adding your first meal above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {summary.food_items.map((item: FoodItem) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">🍴</div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Logged at {formatTime(item.logged_at)}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="bg-orange-100 text-orange-800 font-semibold px-3 py-1"
                          >
                            {item.calories} cal
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>💪 Stay healthy, stay strong!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
