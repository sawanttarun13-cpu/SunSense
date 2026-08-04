import { SunscreenRepository } from '../../repositories/sunscreen/sunscreen.repo';

export class SunscreenService {
  private repo = new SunscreenRepository();

  async applySunscreen(userId: string, appliedSpf: number, appliedAt: Date) {
    const expiresAt = new Date(appliedAt.getTime() + 120 * 60000); // 2 hours
    return this.repo.createApplication(userId, appliedSpf, appliedAt, expiresAt);
  }

  async getActiveApplication(userId: string) {
    const app = await this.repo.getActiveApplication(userId);
    if (!app) return null;
    
    const now = new Date();
    if (now > app.expiresAt) return null; // Expired
    return app;
  }

  calculateRemainingMinutes(expiresAt: Date): number {
    const now = new Date();
    const diff = (expiresAt.getTime() - now.getTime()) / 60000;
    return Math.max(0, Math.floor(diff));
  }
}
