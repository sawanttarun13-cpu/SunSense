"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExposureLogicService = void 0;
const reading_repo_1 = require("../../repositories/reading/reading.repo");
const exposure_repo_1 = require("../../repositories/exposure/exposure.repo");
const calculation_service_1 = require("../calculation/calculation.service");
class ExposureLogicService {
    readingRepo = new reading_repo_1.ReadingRepository();
    exposureRepo = new exposure_repo_1.ExposureRepository();
    calcService = new calculation_service_1.CalculationService();
    async processReadings(userId, deviceId, readings) {
        const sorted = readings.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
        let inserted = 0;
        for (const r of sorted) {
            const recDate = new Date(r.recordedAt);
            const uvValue = Math.max(0, r.uvIndex);
            try {
                await this.readingRepo.createReading(deviceId, uvValue, recDate);
                inserted++;
            }
            catch {
                continue;
            } // ignore duplicates
            const lastSession = await this.exposureRepo.getLastSession(deviceId);
            if (!lastSession) {
                if (uvValue > 0)
                    await this.exposureRepo.createSession(userId, deviceId, recDate, uvValue);
                continue;
            }
            const lastReadingBeforeThis = await this.readingRepo.getLastReadingBefore(deviceId, recDate);
            const diffMinsFromLastReading = lastReadingBeforeThis
                ? (recDate.getTime() - lastReadingBeforeThis.recordedAt.getTime()) / 60000
                : 0;
            if (diffMinsFromLastReading > 15 || recDate.getUTCDay() !== lastSession.endTime.getUTCDay()) {
                if (uvValue > 0)
                    await this.exposureRepo.createSession(userId, deviceId, recDate, uvValue);
            }
            else {
                const lastNonZero = await this.readingRepo.getLastNonZeroReadingBefore(deviceId, recDate);
                const diffFromNonZero = lastNonZero
                    ? (recDate.getTime() - lastNonZero.recordedAt.getTime()) / 60000
                    : Infinity;
                if (diffFromNonZero <= 15) {
                    const newEndTime = uvValue > 0 ? recDate : lastSession.endTime;
                    const duration = Math.floor((newEndTime.getTime() - lastSession.startTime.getTime()) / 1000);
                    const sessionReadings = await this.readingRepo.getSessionReadings(deviceId, lastSession.startTime, newEndTime);
                    const avgUv = sessionReadings.length > 0 ? sessionReadings.reduce((sum, rd) => sum + Number(rd.uvIndex), 0) / sessionReadings.length : 0;
                    let accumulatedSed = 0;
                    let maxUv = 0;
                    for (let i = 1; i < sessionReadings.length; i++) {
                        const prev = sessionReadings[i - 1];
                        const curr = sessionReadings[i];
                        const diffSecs = (curr.recordedAt.getTime() - prev.recordedAt.getTime()) / 1000;
                        accumulatedSed += this.calcService.calculateSedIncrement(Number(curr.uvIndex), diffSecs);
                        if (Number(curr.uvIndex) > maxUv)
                            maxUv = Number(curr.uvIndex);
                    }
                    if (sessionReadings.length > 0 && Number(sessionReadings[0].uvIndex) > maxUv) {
                        maxUv = Number(sessionReadings[0].uvIndex);
                    }
                    const peakRisk = this.calcService.calculateRisk(maxUv);
                    await this.exposureRepo.updateSession(lastSession.sessionId, newEndTime, duration, avgUv, accumulatedSed, peakRisk);
                }
                else {
                    if (uvValue > 0)
                        await this.exposureRepo.createSession(userId, deviceId, recDate, uvValue);
                }
            }
        }
        return { inserted, duplicates: readings.length - inserted };
    }
}
exports.ExposureLogicService = ExposureLogicService;
