"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpfService = void 0;
class SpfService {
    recommendSpf(uvIndex, skinType) {
        if (uvIndex < 3.0)
            return skinType <= 2 ? 15 : 0;
        if (uvIndex < 6.0)
            return skinType <= 3 ? 30 : 15;
        if (uvIndex < 8.0)
            return skinType <= 4 ? 50 : 30;
        return 50;
    }
    calculateUnprotectedBurnTime(uvIndex, skinType) {
        if (uvIndex <= 0)
            return null;
        const baseBurnTimes = {
            1: 67, 2: 100, 3: 200, 4: 300, 5: 400, 6: 500
        };
        const base = baseBurnTimes[skinType] || 100;
        return Math.floor(base / uvIndex);
    }
    calculateProtectedBurnTime(unprotectedBurnTime, appliedSpf) {
        if (unprotectedBurnTime === null)
            return null;
        return unprotectedBurnTime * Math.max(1, appliedSpf);
    }
}
exports.SpfService = SpfService;
