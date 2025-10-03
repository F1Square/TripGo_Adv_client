// Component preloader utility for better performance
export const preloadComponent = (componentImport: () => Promise<any>) => {
  // Only preload in the browser environment
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        componentImport();
      });
    } else {
      setTimeout(() => {
        componentImport();
      }, 100);
    }
  }
};

// Preload critical components after initial app load
export const preloadCriticalComponents = () => {
  // Preload Dashboard components that are likely to be used
  preloadComponent(() => import('../components/Dashboard'));
  preloadComponent(() => import('../components/TripHistory'));
  preloadComponent(() => import('../components/NewTripForm'));
};

// Preload map component when user starts a trip
export const preloadMapComponents = () => {
  preloadComponent(() => import('../components/TripMap'));
  preloadComponent(() => import('../components/ActiveTrip'));
};