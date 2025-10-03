import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

interface GeolocationState {
  position: Position | null;
  isTracking: boolean;
  error: string | null;
  permission: PermissionState | null;
  backgroundSupport: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    isTracking: false,
    error: null,
    permission: null,
    backgroundSupport: false,
  });

  const [watchId, setWatchId] = useState<number | null>(null);
  const lastKnownPositionRef = useRef<Position | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check geolocation permission and background support
  useEffect(() => {
    const checkSupport = async () => {
      let backgroundSupport = false;
      
      // Check for background geolocation support
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setState(prev => ({ ...prev, permission: result.state }));
          
          // Check if service worker is available for background tracking
          if ('serviceWorker' in navigator) {
            backgroundSupport = true;
          }
        } catch (error) {
          console.warn('Permission query failed:', error);
        }
      }
      
      setState(prev => ({ ...prev, backgroundSupport }));
    };
    
    checkSupport();
  }, []);

  // Register service worker for background tracking
  useEffect(() => {
    if ('serviceWorker' in navigator && state.backgroundSupport) {
      const registerSW = async () => {
        try {
          // Create inline service worker for background geolocation
          const swCode = `
            let watchId = null;
            
            self.addEventListener('message', (event) => {
              if (event.data.type === 'START_TRACKING') {
                if (watchId) {
                  navigator.geolocation.clearWatch(watchId);
                }
                
                watchId = navigator.geolocation.watchPosition(
                  (position) => {
                    event.ports[0].postMessage({
                      type: 'POSITION_UPDATE',
                      position: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp,
                        speed: position.coords.speed,
                        heading: position.coords.heading
                      }
                    });
                  },
                  (error) => {
                    event.ports[0].postMessage({
                      type: 'POSITION_ERROR',
                      error: error.message
                    });
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 3000
                  }
                );
              } else if (event.data.type === 'STOP_TRACKING') {
                if (watchId) {
                  navigator.geolocation.clearWatch(watchId);
                  watchId = null;
                }
              }
            });
          `;
          
          const blob = new Blob([swCode], { type: 'application/javascript' });
          const swUrl = URL.createObjectURL(blob);
          
          await navigator.serviceWorker.register(swUrl);
        } catch (error) {
          console.warn('Service worker registration failed:', error);
        }
      };
      
      registerSW();
    }
  }, [state.backgroundSupport]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser.',
        isTracking: false 
      }));
      return;
    }

    // Enhanced options for better accuracy and background tracking
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 3000, // Reduced for more frequent updates
    };

    const handleSuccess = (pos: GeolocationPosition) => {
      const position: Position = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
        speed: pos.coords.speed || undefined,
        heading: pos.coords.heading || undefined,
      };

      // Store last known position for background fallback
      lastKnownPositionRef.current = position;
      
      // Save to localStorage for persistence across sessions
      localStorage.setItem('trip_tracker_last_position', JSON.stringify(position));

      setState(prev => ({
        ...prev,
        position,
        error: null,
        isTracking: true,
      }));
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown location error';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions for accurate tracking.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Using last known position if available.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Retrying...';
          break;
      }

      // Try to use last known position if available
      if (lastKnownPositionRef.current && error.code !== error.PERMISSION_DENIED) {
        const lastPosition = { ...lastKnownPositionRef.current, timestamp: Date.now() };
        setState(prev => ({
          ...prev,
          position: lastPosition,
          error: `${errorMessage} Using last known position.`,
          isTracking: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isTracking: false,
        }));
      }
    };

    // Start primary tracking
    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    setWatchId(id);
    
    // Set up additional background tracking interval for better reliability
    const backgroundInterval = setInterval(() => {
      if (document.hidden || document.visibilityState === 'hidden') {
        // App is in background, get current position
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (error) => {
            // Silently handle background errors, don't update UI
            console.warn('Background position update failed:', error.message);
          },
          { ...options, timeout: 5000 }
        );
      }
    }, 30000); // Every 30 seconds when in background

    trackingIntervalRef.current = backgroundInterval;
    setState(prev => ({ ...prev, isTracking: true, error: null }));
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    
    setState(prev => ({ ...prev, isTracking: false }));
  }, [watchId]);

  const getCurrentPosition = useCallback((): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position: Position = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
            speed: pos.coords.speed || undefined,
            heading: pos.coords.heading || undefined,
          };
          
          // Update last known position
          lastKnownPositionRef.current = position;
          localStorage.setItem('trip_tracker_last_position', JSON.stringify(position));
          
          resolve(position);
        },
        (error) => {
          // Try to use last known position if available
          const savedPosition = localStorage.getItem('trip_tracker_last_position');
          if (savedPosition && error.code !== error.PERMISSION_DENIED) {
            try {
              const lastPos = JSON.parse(savedPosition);
              // Use last position but update timestamp
              resolve({ ...lastPos, timestamp: Date.now() });
              return;
            } catch (e) {
              // Ignore parse errors and proceed with rejection
            }
          }
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // Allow slightly older positions for reliability
        }
      );
    });
  }, []);

  // Load last known position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('trip_tracker_last_position');
    if (savedPosition) {
      try {
        const lastPos = JSON.parse(savedPosition);
        lastKnownPositionRef.current = lastPos;
      } catch (error) {
        console.warn('Failed to load last known position:', error);
      }
    }
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentPosition,
  };
};