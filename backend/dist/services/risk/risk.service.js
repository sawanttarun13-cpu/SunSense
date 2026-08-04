"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskService = void 0;
class RiskService {
    calculateRisk(uvIndex) {
        if (uvIndex < 3.0)
            return 'LOW';
        if (uvIndex < 6.0)
            return 'MODERATE';
        if (uvIndex < 8.0)
            return 'HIGH';
        if (uvIndex < 11.0)
            return 'VERY_HIGH';
        return 'EXTREME';
    }
    // Helper to determine if a new risk level is higher than the current one
    isHigherRisk(newRisk, currentRisk) {
        const riskOrder = {
            'LOW': 1,
            'MODERATE': 2,
            'HIGH': 3,
            'VERY_HIGH': 4,
            'EXTREME': 5
        };
        return riskOrder[newRisk] > riskOrder[currentRisk];
    }
}
exports.RiskService = RiskService;
