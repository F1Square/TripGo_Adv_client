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
      // Common config values; will be refined when plugin integrated
      desiredAccuracy: 0, // Highest
      distanceFilter: 25,
      stopOnTerminate: false,
      startOnBoot: true,
      notificationTitle: 'Trip tracking active',
      notificationBody: 'Collecting location for your trip',
      stationaryRadius: 25
    }
  }
};

export default config;
