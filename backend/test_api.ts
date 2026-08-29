import { HistoryService } from './src/services/history/history.service';

async function run() {
  const userId = 'be6fc0f4-6c04-4abe-a55a-bb080e892153';
  
  const historySvc = new HistoryService();
  const hist = await historySvc.getHistory(userId, 1, 5);
  console.log('HISTORY:');
  console.log(JSON.stringify(hist, null, 2));
}
run();
