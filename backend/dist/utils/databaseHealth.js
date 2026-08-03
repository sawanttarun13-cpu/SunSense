"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDatabaseHealth = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = require("./logger");
const checkDatabaseHealth = async () => {
    try {
        // Attempt a very simple, fast query that doesn't hit any specific table
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        logger_1.logger.error('Database health check failed', error);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
