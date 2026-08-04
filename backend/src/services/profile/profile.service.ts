import { ProfileRepository } from '../../repositories/profile/profile.repo';
const profileRepo = new ProfileRepository();

export class ProfileService {
  async getProfile(userId: string) {
    const profile = await profileRepo.findById(userId);
    if (!profile) throw new Error('Profile not found');
    return profile;
  }
  async updateProfile(userId: string, data: any) {
    return profileRepo.update(userId, data);
  }
}
