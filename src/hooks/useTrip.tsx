import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { useGeolocation } from './useGeolocation';
import { tripService, Trip, TripPoint } from '../services/tripService';
import { preloadMapComponents } from '../utils/componentPreloader';
import { throttle } from '../utils/performance';

// Import wake lock types
/// <reference path="../types/wakelock.d.ts" />

interface TripState {
  currentTrip: Trip | null;
  tripHistory: Trip[];
  isActive: boolean;
  isLoading: boolean;
  // Geo
  position: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    speed?: number;
    heading?: number;
  } | null;
  gpsError: string | null;
  backgroundSupport: boolean;
}
type TripContextType = TripState & {
  startTrip: (purpose: string, startOdometer: number) => Promise<{ success: boolean; error?: string }>;
  endTrip: (endOdometer: number) => Promise<{ success: boolean; error?: string; trip?: Trip }>;
  deleteTrip: (tripId: string) => Promise<{ success: boolean; error?: string }>;
  exportTripsToCSV: () => void;
  exportTripsToCSVRange: (startDate: string, endDate: string) => Promise<void>;
};

const TripContext = createContext<TripContextType | null>(null);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TripState>({
    currentTrip: null,
    tripHistory: [],
    isActive: false,
    isLoading: false,
    position: null,
    gpsError: null,
    backgroundSupport: false,
  });

  const { position, startTracking, stopTracking, getCurrentPosition, error, backgroundSupport } = useGeolocation();
  
  // Wake Lock API for keeping screen active during trips
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  // Handle page visibility changes to maintain tracking in background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (state.isActive) {
        if (document.visibilityState === 'hidden') {
          // App going to background - ensure tracking continues
          console.log('App backgrounded - maintaining GPS tracking');
        } else if (document.visibilityState === 'visible') {
          // App coming to foreground - refresh current position
          console.log('App foregrounded - refreshing position');
          if (state.isActive) {
            getCurrentPosition().catch(error => {
              console.warn('Failed to refresh position on foreground:', error);
            });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isActive, getCurrentPosition]);

  // Cleanup wake lock on unmount
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(error => {
          console.warn('Failed to release wake lock on cleanup:', error);
        });
      }
    };
  }, [wakeLock]);

  // Sync geolocation state into provider
  useEffect(() => {
    setState(prev => ({ ...prev, position: position || null, gpsError: error || null, backgroundSupport }));
  }, [position, error, backgroundSupport]);

  // Load trip data from MongoDB on mount
  useEffect(() => {
    const loadTripsFromDB = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        // Load only completed trip history
        const tripsResponse = await tripService.getAllTrips('completed', 1000, 1);
        if (tripsResponse.success && tripsResponse.data) {
          setState(prev => ({ 
            ...prev, 
            tripHistory: ((tripsResponse.data?.data) || []).filter((t: Trip) => t.status === 'completed') 
          }));
        }

        // Check for active trip
        const activeResponse = await tripService.getActiveTrip();
        if (activeResponse.success && activeResponse.data) {
          setState(prev => ({ 
            ...prev, 
            currentTrip: activeResponse.data, 
            isActive: true 
          }));
          startTracking(); // Resume tracking if there's an active trip
        }
      } catch (error) {
        console.error('Failed to load trips from database:', error);
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadTripsFromDB();
  }, [startTracking]);

  // Update current trip with new position data (save to MongoDB)
  useEffect(() => {
    if (state.isActive && state.currentTrip && state.position) {
      const newPoint: TripPoint = {
        latitude: state.position.latitude,
        longitude: state.position.longitude,
        timestamp: state.position.timestamp,
        accuracy: state.position.accuracy,
      };

      setState(prev => {
        if (!prev.currentTrip) return prev;

        const currentRoute = prev.currentTrip.route;
        
        // Only add point if it's significantly different from last point
        const lastPoint = currentRoute[currentRoute.length - 1];
        if (lastPoint) {
          const timeDiff = (newPoint.timestamp - lastPoint.timestamp) / 1000;
          const distance = haversineDistance(lastPoint, newPoint);
          
          // Skip if point is too recent (< 3 seconds) and too close (< 3 meters)
          if (timeDiff < 3 && distance < 0.003) {
            return prev;
          }
          
          // Skip if accuracy is too poor (> 50m) unless it's been a while since last update
          if (newPoint.accuracy > 50 && timeDiff < 30) {
            return prev;
          }
        }

        const updatedRoute = [...currentRoute, newPoint];
        const distance = calculateDistance(updatedRoute);
        const startTime = prev.currentTrip.startTime || prev.currentTrip.createdAt;
        const duration = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
        const averageSpeed = duration > 0 ? (distance / duration) * 3.6 : 0; // km/h

        const updatedTrip = {
          ...prev.currentTrip,
          route: updatedRoute,
          distance,
          duration,
          averageSpeed,
        };

        // Save to MongoDB every 10 GPS points to avoid too many requests
        if (updatedRoute.length % 10 === 0) {
          tripService.updateGPSPoints(prev.currentTrip._id, updatedRoute).catch(error => {
            console.warn('Failed to update GPS points in database:', error);
          });
        }

        return {
          ...prev,
          currentTrip: updatedTrip,
        };
      });
    }
  }, [state.position, state.isActive, state.currentTrip]);

  const startTrip = useCallback(async (purpose: string, startOdometer: number) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const startPosition = await getCurrentPosition();
      
      // Create trip in database
      const createResponse = await tripService.createTrip({
        purpose,
        startOdometer,
        route: [{
          latitude: startPosition.latitude,
          longitude: startPosition.longitude,
          timestamp: startPosition.timestamp,
          accuracy: startPosition.accuracy,
        }]
      });

      if (!createResponse.success || !createResponse.data) {
        throw new Error(createResponse.error || 'Failed to create trip in database');
      }

      const newTrip = createResponse.data.data;

      setState(prev => ({
        ...prev,
        currentTrip: newTrip,
        isActive: true,
        isLoading: false,
      }));

      // Refresh trip history to get updated data (completed only)
      try {
        const tripsResponse = await tripService.getAllTrips('completed', 1000, 1);
        if (tripsResponse.success && tripsResponse.data) {
          setState(prev => ({ 
            ...prev, 
            tripHistory: ((tripsResponse.data?.data) || []).filter((t: Trip) => t.status === 'completed') 
          }));
        }
      } catch (error) {
        console.warn('Failed to refresh trip history after starting trip:', error);
      }

      startTracking();

      // Preload map components for active trip
      preloadMapComponents();

      // Request wake lock to keep screen active during trip
      try {
        if ('wakeLock' in navigator && navigator.wakeLock) {
          const wakeLockSentinel = await navigator.wakeLock.request('screen');
          setWakeLock(wakeLockSentinel);
          console.log('Wake lock activated for trip tracking');
        }
      } catch (wakeLockError) {
        console.warn('Wake lock failed:', wakeLockError);
        // Continue without wake lock - not critical
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to start trip:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error instanceof Error ? error.message : 'Failed to start trip' };
    }
  }, [getCurrentPosition, startTracking]);

  const endTrip = useCallback(async (endOdometer: number) => {
    if (!state.currentTrip) return { success: false, error: 'No active trip' };

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const endPosition = await getCurrentPosition();
      
      // Update trip in database with final GPS point and end it
      const finalRoute = [...state.currentTrip.route, {
        latitude: endPosition.latitude,
        longitude: endPosition.longitude,
        timestamp: endPosition.timestamp,
        accuracy: endPosition.accuracy,
      }];

      // End trip in database
      const endResponse = await tripService.endTrip(state.currentTrip._id, {
        endOdometer,
      });

      if (!endResponse.success || !endResponse.data) {
        throw new Error(endResponse.error || 'Failed to end trip in database');
      }

      const completedTrip = endResponse.data.data;

      // Update local state
      setState(prev => ({
        ...prev,
        currentTrip: null,
        isActive: false,
        isLoading: false,
        tripHistory: [completedTrip, ...prev.tripHistory],
      }));

      stopTracking();

      // Release wake lock when trip ends
      if (wakeLock) {
        try {
          await wakeLock.release();
          setWakeLock(null);
          console.log('Wake lock released after trip completion');
        } catch (error) {
          console.warn('Failed to release wake lock:', error);
        }
      }

      return { success: true, trip: completedTrip };
    } catch (error) {
      console.error('Failed to end trip:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error instanceof Error ? error.message : 'Failed to end trip' };
    }
  }, [state.currentTrip, getCurrentPosition, stopTracking, wakeLock]);

  const deleteTrip = useCallback(async (tripId: string) => {
    try {
      const deleteResponse = await tripService.deleteTrip(tripId);
      
      if (deleteResponse.success) {
        setState(prev => ({
          ...prev,
          tripHistory: prev.tripHistory.filter(trip => trip._id !== tripId),
        }));
        return { success: true };
      } else {
        return { success: false, error: deleteResponse.error };
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
      return { success: false, error: 'Failed to delete trip' };
    }
  }, []);

  const exportTripsToCSV = useCallback(() => {
    const csvHeader = 'Date,Purpose,Start Odometer,End Odometer,Distance (km),Duration (hours),Average Speed (km/h),Start Location,End Location\n';
    
    const csvRows = state.tripHistory.map(trip => {
      const date = new Date(trip.startTime || trip.createdAt).toLocaleDateString();
      const durationHours = (trip.duration / 3600).toFixed(2);
      const distance = trip.distance.toFixed(2);
      const avgSpeed = trip.averageSpeed.toFixed(1);
      
      return `${date},"${trip.purpose}",${trip.startOdometer},${trip.endOdometer || ''},${distance},${durationHours},${avgSpeed},"${trip.startLocation || ''}","${trip.endLocation || ''}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `business_trips_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [state.tripHistory]);

  const exportTripsToCSVRange = useCallback(async (startDate: string, endDate: string) => {
    // Fetch a large page of completed trips and filter client-side by date
    const resp = await tripService.getAllTrips('completed', 1000, 1);
    const all = resp.success && resp.data ? (resp.data.data || []) : state.tripHistory;
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Include entire end day
    end.setHours(23, 59, 59, 999);

    const filtered = all.filter(t => {
      const d = new Date(t.startTime || t.createdAt);
      return d >= start && d <= end;
    });

    const csvHeader = 'Date,Purpose,Start Odometer,End Odometer,Distance (km),Duration (hours),Average Speed (km/h),Start Location,End Location\n';
    const csvRows = filtered.map(trip => {
      const date = new Date(trip.startTime || trip.createdAt).toLocaleDateString();
      const durationHours = (trip.duration / 3600).toFixed(2);
      const distance = trip.distance.toFixed(2);
      const avgSpeed = trip.averageSpeed.toFixed(1);
      return `${date},"${trip.purpose}",${trip.startOdometer},${trip.endOdometer || ''},${distance},${durationHours},${avgSpeed},"${trip.startLocation || ''}","${trip.endLocation || ''}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `business_trips_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [state.tripHistory]);

  const contextValue: TripContextType = {
    ...state,
    startTrip,
    endTrip,
    deleteTrip,
    exportTripsToCSV,
    exportTripsToCSVRange,
  };

  return (
    <TripContext.Provider value={contextValue}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTrip must be used within TripProvider');
  }
  return ctx;
};

// These functions are no longer needed with MongoDB storage
// The backend will handle data compression and storage optimization

// Enhanced helper function to calculate distance with accuracy filtering
function calculateDistance(route: TripPoint[]): number {
  if (route.length < 2) return 0;

  let totalDistance = 0;
  let filteredRoute = filterAccuratePoints(route);
  
  for (let i = 1; i < filteredRoute.length; i++) {
    const prev = filteredRoute[i - 1];
    const curr = filteredRoute[i];
    
    // Skip points that are too close in time (< 5 seconds) to avoid GPS noise
    const timeDiff = (curr.timestamp - prev.timestamp) / 1000;
    if (timeDiff < 5) continue;
    
    const distance = haversineDistance(prev, curr);
    
    // Filter out unrealistic speeds (> 200 km/h for ground travel)
    const speed = (distance / timeDiff) * 3.6; // km/h
    if (speed > 200) continue;
    
    totalDistance += distance;
  }
  
  return totalDistance;
}

// Filter GPS points based on accuracy to improve distance calculation
function filterAccuratePoints(route: TripPoint[]): TripPoint[] {
  return route.filter(point => {
    // Only use points with accuracy better than 50 meters
    return point.accuracy <= 50;
  }).filter((point, index, array) => {
    if (index === 0) return true;
    
    // Remove points that are too close to the previous point (< 5 meters)
    const prev = array[index - 1];
    const distance = haversineDistance(prev, point);
    return distance >= 0.005; // 5 meters minimum
  });
}

// Pure Haversine distance calculation
function haversineDistance(point1: TripPoint, point2: TripPoint): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
