import { apiService } from './api';

export interface UserDataRecord {
  _id: string;
  userId: string;
  currentOdometer: number;
  activeTrip: string | null;
  createdAt: string;
  updatedAt: string;
  activeTripDetails?: any;
}

class UserDataService {
  async getUserData() {
    return await apiService.get<{ data: UserDataRecord }>('/userdata');
  }

  async updateOdometer(currentOdometer: number) {
    return await apiService.put<{ data: UserDataRecord }>('/userdata/odometer', { currentOdometer });
  }

  async setActiveTrip(tripId: string) {
    return await apiService.put<{ data: UserDataRecord }>('/userdata/active-trip', { tripId });
  }

  async clearActiveTrip() {
    return await apiService.delete<{ data: UserDataRecord }>('/userdata/active-trip');
  }
}

export const userDataService = new UserDataService();
export default userDataService;