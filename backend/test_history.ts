import { prisma } from './src/config/prisma';
import { HistoryService } from './src/services/history/history.service';
import { AnalyticsService } from './src/services/analytics/analytics.service';

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found");
    return;
  }
  
  console.log("Testing history service for user:", user.id);
  try {
    const historyService = new HistoryService();
    const history = await historyService.getHistory(user.id, 1, 14);
    console.log("History OK:", history.data.length, "items");
  } catch (e: any) {
    console.log("History Error:", e.message);
  }

  console.log("Testing analytics service for user:", user.id);
  try {
    const analyticsService = new AnalyticsService();
    const analytics = await analyticsService.getAnalytics(user.id, 'daily', new Date().getTimezoneOffset());
    console.log("Analytics OK:", analytics.data.length, "items");
  } catch (e: any) {
    console.log("Analytics Error:", e.message);
  }
}

run().catch(console.error).finally(() => process.exit(0));
