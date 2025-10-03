import { apiService } from './api';

// Trip interfaces matching backend MongoDB schema
export interface TripPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
}

export interface Trip {
  _id: string;
  id?: string;
  userId: string;
  purpose: string;
  startTime?: string;
  endTime?: string;
  startOdometer: number;
  endOdometer?: number;
  startLocation?: string;
  endLocation?: string;
  distance: number;
  duration: number;
  route: TripPoint[];
  status: 'active' | 'completed';
  averageSpeed: number;
  createdAt: string;
  updatedAt: string;
}

// Trip request interfaces
export interface CreateTripRequest {
  purpose: string;
  startOdometer: number;
  route?: TripPoint[];
}

export interface UpdateTripRequest {
  route?: TripPoint[];
  startLocation?: string;
  endLocation?: string;
}

export interface EndTripRequest {
  endOdometer: number;
  endLocation?: string;
}

class TripService {
  // Get all trips for the current user
  async getAllTrips(status?: 'active' | 'completed', limit = 50, page = 1) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('page', page.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/trips?${queryString}` : '/trips';
    
    return await apiService.get<{
      data: Trip[];
      count: number;
      total: number;
      page: number;
      pages: number;
    }>(endpoint);
  }

  // Get a specific trip by ID
  async getTripById(tripId: string) {
    return await apiService.get<{ data: Trip }>(`/trips/${tripId}`);
  }

  // Create a new trip
  async createTrip(tripData: CreateTripRequest) {
    return await apiService.post<{ data: Trip }>('/trips', tripData);
  }

  // Update an existing trip (mainly for adding GPS points)
  async updateTrip(tripId: string, updateData: UpdateTripRequest) {
    return await apiService.put<{ data: Trip }>(`/trips/${tripId}`, updateData);
  }

  // End a trip
  async endTrip(tripId: string, endData: EndTripRequest) {
    return await apiService.put<{ data: Trip }>(`/trips/${tripId}/end`, endData);
  }

  // Delete a trip
  async deleteTrip(tripId: string) {
    return await apiService.delete(`/trips/${tripId}`);
  }

  // Get active trip (if any)
  async getActiveTrip() {
    const result = await this.getAllTrips('active', 1);
    if (result.success && result.data && result.data.data.length > 0) {
      return {
        success: true,
        data: result.data.data[0]
      };
    }
    return {
      success: true,
      data: null
    };
  }

  // Batch update GPS points for active trip
  async updateGPSPoints(tripId: string, points: TripPoint[]) {
    return await this.updateTrip(tripId, { route: points });
  }
}

// Create and export a default instance
export const tripService = new TripService();
export default tripService;