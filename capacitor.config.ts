import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tripmetrics.app',
  appName: 'TripMetricsPro',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    // Placeholder for background geolocation plugin configuration
    BackgroundGeolocation: {
      // Tuned configuration for continuous automotive trip tracking.
      // desiredAccuracy 0 = highest (per plugin docs)
      desiredAccuracy: 0,
      // Lower distance filter to capture more granular movement without flooding (meters)
      distanceFilter: 15,
      // Keep tracking after app terminate / device reboot for long trips
      stopOnTerminate: false,
      startOnBoot: true,
      // iOS specific: purpose classification optimizes chipset behavior for navigation
      activityType: 'automotiveNavigation',
      // Prevent iOS from pausing updates when it thinks user is stationary (we compute distance ourselves)
      pauseLocationUpdates: false,
      // Android foreground service notification
      notificationTitle: 'Trip tracking active',
      notificationBody: 'Collecting location for your trip',
      // Radius to consider device stationary (affects batching). Keep modest.
      stationaryRadius: 20,
      // How often (ms) to force a location update even if distanceFilter not hit (Android) - balance battery vs fidelity
      locationUpdateInterval: 30000,
      // Fastest interval Android will deliver (throttle floor)
      fastestLocationUpdateInterval: 15000
    }
  }
};

export default config;
