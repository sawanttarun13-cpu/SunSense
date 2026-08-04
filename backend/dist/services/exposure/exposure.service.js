"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExposureService = void 0;
const prisma_1 = require("../../config/prisma");
const dose_service_1 = require("../dose/dose.service");
const risk_service_1 = require("../risk/risk.service");
class ExposureService {
    doseService = new dose_service_1.DoseService();
    riskService = new risk_service_1.RiskService();
    async processReadings(userId, deviceId, readings) {
        const sorted = readings.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
        let inserted = 0;
        for (const r of sorted) {
            const recDate = new Date(r.recordedAt);
            const uvValue = Math.max(0, r.uvIndex);
            try {
                await prisma_1.prisma.uVReading.create({ data: { deviceId, uvIndex: uvValue, recordedAt: recDate } });
                inserted++;
            }
            catch {
                continue;
            } // ignore duplicates
            const lastSession = await prisma_1.prisma.exposureSession.findFirst({
                where: { deviceId },
                orderBy: { endTime: 'desc' }
            });
            if (!lastSession) {
                if (uvValue > 0)
                    await this.createSession(userId, deviceId, recDate, uvValue);
                continue;
            }
            const lastReadingBeforeThis = await prisma_1.prisma.uVReading.findFirst({
                where: { deviceId, recordedAt: { lt: recDate } },
                orderBy: { recordedAt: 'desc' }
            });
            const diffMinsFromLastReading = lastReadingBeforeThis
                ? (recDate.getTime() - lastReadingBeforeThis.recordedAt.getTime()) / 60000
                : 0;
            if (diffMinsFromLastReading > 15 || recDate.getUTCDay() !== lastSession.endTime.getUTCDay()) {
                if (uvValue > 0)
                    await this.createSession(userId, deviceId, recDate, uvValue);
            }
            else {
                const lastNonZero = await prisma_1.prisma.uVReading.findFirst({
                    where: { deviceId, uvIndex: { gt: 0 }, recordedAt: { lte: recDate } },
                    orderBy: { recordedAt: 'desc' }
                });
                const diffFromNonZero = lastNonZero
                    ? (recDate.getTime() - lastNonZero.recordedAt.getTime()) / 60000
                    : Infinity;
                if (diffFromNonZero <= 15) {
                    const newEndTime = uvValue > 0 ? recDate : lastSession.endTime;
                    const duration = Math.floor((newEndTime.getTime() - lastSession.startTime.getTime()) / 1000);
                    const sessionReadings = await prisma_1.prisma.uVReading.findMany({
                        where: { deviceId, recordedAt: { gte: lastSession.startTime, lte: newEndTime } }
                    });
                    const avgUv = sessionReadings.length > 0 ? sessionReadings.reduce((sum, rd) => sum + Number(rd.uvIndex), 0) / sessionReadings.length : 0;
                    let accumulatedSed = 0;
                    let maxUv = 0;
                    for (let i = 1; i < sessionReadings.length; i++) {
                        const prev = sessionReadings[i - 1];
                        const curr = sessionReadings[i];
                        const diffSecs = (curr.recordedAt.getTime() - prev.recordedAt.getTime()) / 1000;
                        accumulatedSed += this.doseService.calculateSedIncrement(Number(curr.uvIndex), diffSecs);
                        if (Number(curr.uvIndex) > maxUv)
                            maxUv = Number(curr.uvIndex);
                    }
                    if (sessionReadings.length > 0 && Number(sessionReadings[0].uvIndex) > maxUv) {
                        maxUv = Number(sessionReadings[0].uvIndex);
                    }
                    const peakRisk = this.riskService.calculateRisk(maxUv);
                    await prisma_1.prisma.exposureSession.update({
                        where: { sessionId: lastSession.sessionId },
                        data: { endTime: newEndTime, durationSeconds: duration, averageUvIndex: avgUv, accumulatedSed, calculatedRisk: peakRisk }
                    });
                }
                else {
                    if (uvValue > 0)
                        await this.createSession(userId, deviceId, recDate, uvValue);
                }
            }
        }
        // Update heartbeat
        await prisma_1.prisma.device.update({
            where: { id: deviceId },
            data: { lastPing: new Date() }
        });
        return { inserted, duplicates: readings.length - inserted };
    }
    async createSession(userId, deviceId, startTime, uvValue) {
        await prisma_1.prisma.exposureSession.create({
            data: {
                userId, deviceId, startTime, endTime: startTime,
                durationSeconds: 0, averageUvIndex: uvValue, accumulatedSed: 0, calculatedRisk: 'LOW'
            }
        });
    }
}
exports.ExposureService = ExposureService;
