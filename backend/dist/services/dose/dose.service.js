"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoseService = void 0;
class DoseService {
    calculateSedIncrement(uvIndex, timeIntervalSeconds) {
        if (uvIndex <= 0)
            return 0;
        if (timeIntervalSeconds > 900 || timeIntervalSeconds < 0)
            return 0; // Gap > 15m or invalid
        return (uvIndex * timeIntervalSeconds) / 4000;
    }
}
exports.DoseService = DoseService;
