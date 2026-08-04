"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryService = void 0;
const history_repo_1 = require("../../repositories/history/history.repo");
const historyRepo = new history_repo_1.HistoryRepository();
class HistoryService {
    async getHistory(userId, page, limit, startDateStr, endDateStr) {
        const skip = (page - 1) * limit;
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;
        const { data, total } = await historyRepo.findMany(userId, skip, limit, startDate, endDate);
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            pagination: {
                page, limit, total, totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            }
        };
    }
    async getSession(userId, id) {
        const session = await historyRepo.findById(userId, id);
        if (!session)
            throw new Error('Session not found');
        return session;
    }
}
exports.HistoryService = HistoryService;
