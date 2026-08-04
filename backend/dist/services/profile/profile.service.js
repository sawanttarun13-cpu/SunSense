"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const profile_repo_1 = require("../../repositories/profile/profile.repo");
const profileRepo = new profile_repo_1.ProfileRepository();
class ProfileService {
    async getProfile(userId) {
        const profile = await profileRepo.findById(userId);
        if (!profile)
            throw new Error('Profile not found');
        return profile;
    }
    async updateProfile(userId, data) {
        return profileRepo.update(userId, data);
    }
}
exports.ProfileService = ProfileService;
