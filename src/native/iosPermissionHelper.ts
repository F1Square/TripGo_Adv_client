import { Capacitor } from '@capacitor/core';
import { getLocationPermissionStatus, requestLocationPermissions, requestAlwaysPermission } from './backgroundLocation';

export interface IOSPermissionAdvice {
  shouldExplain: boolean; 
  canRequestAlways: boolean; 
  status: string; 
}

export async function evaluateIOSPermissionState(): Promise<IOSPermissionAdvice> {
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios') {
    return { shouldExplain: false, canRequestAlways: false, status: 'not-ios' };
  }
  const perm = await getLocationPermissionStatus();
  const status = perm?.location || 'unknown';
  switch (status) {
    case 'granted':
    case 'always':
      return { shouldExplain: false, canRequestAlways: false, status };
    case 'wheninuse':
      return { shouldExplain: true, canRequestAlways: true, status };
    default:
      return { shouldExplain: true, canRequestAlways: false, status };
  }
}

export async function escalateToAlwaysWithUX(onPreExplain: () => Promise<boolean> | boolean) {
  const advice = await evaluateIOSPermissionState();
  if (!advice.canRequestAlways) return advice.status;
  const proceed = await onPreExplain();
  if (!proceed) return advice.status;
  const result = await requestAlwaysPermission();
  return result?.location || 'unknown';
}

export async function initialPermissionFlow() {
  const platform = Capacitor.getPlatform();
  if (platform !== 'ios') return { platform };
  const current = await getLocationPermissionStatus();
  if (current.location === 'denied') {
    // Prompt once for when-in-use to re-trigger system dialog
    await requestLocationPermissions(false);
  }
  return current;
}
