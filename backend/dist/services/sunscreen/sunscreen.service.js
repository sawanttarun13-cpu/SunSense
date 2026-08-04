"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SunscreenService = void 0;
const sunscreen_repo_1 = require("../../repositories/sunscreen/sunscreen.repo");
class SunscreenService {
    repo = new sunscreen_repo_1.SunscreenRepository();
    async applySunscreen(userId, appliedSpf, appliedAt) {
        const expiresAt = new Date(appliedAt.getTime() + 120 * 60000); // 2 hours
        return this.repo.createApplication(userId, appliedSpf, appliedAt, expiresAt);
    }
    async getActiveApplication(userId) {
        const app = await this.repo.getActiveApplication(userId);
        if (!app)
            return null;
        const now = new Date();
        if (now > app.expiresAt)
            return null; // Expired
        return app;
    }
    calculateRemainingMinutes(expiresAt) {
        const now = new Date();
        const diff = (expiresAt.getTime() - now.getTime()) / 60000;
        return Math.max(0, Math.floor(diff));
    }
}
exports.SunscreenService = SunscreenService;
