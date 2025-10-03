// Wrapper around Capacitor community background geolocation plugin
// Provides a unified API used by hooks.

// Types conditional import to avoid runtime crash if plugin not installed in web dev mode.
import { Capacitor } from '@capacitor/core';

let BackgroundGeolocation: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  BackgroundGeolocation = require('@capacitor-community/background-geolocation').BackgroundGeolocation;
} catch (e) {
  // Fallback mock for web
  BackgroundGeolocation = {
    initialize: async () => ({ initialized: true }),
    addWatcher: async (_options: any, callback: any) => {
      console.warn('BackgroundGeolocation mock addWatcher in web mode.');
      return 'mock-watcher';
    },
    removeWatcher: async () => undefined,
    requestPermissions: async () => ({ location: 'granted' })
  };
}

export interface BgLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  time: number; // ms epoch
  speed?: number;
  bearing?: number;
}

export interface WatcherOptions {
  backgroundMessage?: string;
  backgroundTitle?: string;
  requestPermissions?: boolean;
  stale?: boolean;
  distanceFilter?: number; // meters
}

export type LocationCallback = (loc: BgLocation) => void;

let activeWatcherId: string | null = null;

export async function requestLocationPermissions(always = false) {
  const platform = Capacitor.getPlatform();
  const perms = always ? ['always'] : (platform === 'ios' ? ['wheninuse'] : ['always']);
  try {
    return await BackgroundGeolocation.requestPermissions({ permissions: perms });
  } catch (e) {
    console.warn('Permission request failed', e);
    return { location: 'denied' };
  }
}

export async function requestAlwaysPermission() {
  return requestLocationPermissions(true);
}

export async function getLocationPermissionStatus() {
  if (BackgroundGeolocation.getPermissions) {
    try {
      return await BackgroundGeolocation.getPermissions();
    } catch (e) {
      return { location: 'unknown' };
    }
  }
  return { location: 'unknown' };
}

export async function startBackgroundTracking(cb: LocationCallback, opts: WatcherOptions = {}) {
  if (activeWatcherId) return activeWatcherId;

  await BackgroundGeolocation.initialize();
  const watcherId = await BackgroundGeolocation.addWatcher({
    backgroundMessage: opts.backgroundMessage || 'Tracking active trip…',
    backgroundTitle: opts.backgroundTitle || 'Trip tracking',
    requestPermissions: opts.requestPermissions !== false,
    stale: opts.stale ?? false,
    distanceFilter: opts.distanceFilter ?? 25,
  }, (location: any, error: any) => {
    if (error) {
      console.warn('BG location error', error);
      return;
    }
    if (!location) return;
    const mapped: BgLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy || 0,
      time: location.time || Date.now(),
      speed: location.speed,
      bearing: location.bearing,
    };
    cb(mapped);
  });

  activeWatcherId = watcherId;
  return watcherId;
}

export async function stopBackgroundTracking() {
  if (!activeWatcherId) return;
  try {
    await BackgroundGeolocation.removeWatcher({ id: activeWatcherId });
  } catch (e) {
    console.warn('Failed removing watcher', e);
  } finally {
    activeWatcherId = null;
  }
}
