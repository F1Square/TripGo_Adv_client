import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateIOSPermissionState, escalateToAlwaysWithUX } from '../native/iosPermissionHelper';
import { startBackgroundTracking, stopBackgroundTracking, requestLocationPermissions, BgLocation } from '../native/backgroundLocation';
import tripService, { TripPoint } from '../services/tripService';

interface TrackingState {
  active: boolean;
  permission: string | null;
  lastPoint: TripPoint | null;
  queued: number;
  error: string | null;
  clientDistanceKm: number;
}

// Simple offline queue using localStorage; could swap to IndexedDB later.
const STORAGE_KEY = 'trip_bg_queue_v1';
const FLUSH_POINT_THRESHOLD = 20; // points
const FLUSH_INTERVAL_MS = 60000; // periodic flush
const FLUSH_ON_FOREGROUND = true;

function loadQueue(): TripPoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TripPoint[];
  } catch {
    return [];
  }
}
function saveQueue(q: TripPoint[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(q)); } catch {}
}

export function useBackgroundTripTracking(tripId: string | null) {
  const [state, setState] = useState<TrackingState>({
    active: false,
    permission: null,
    lastPoint: null,
    queued: 0,
    error: null,
    clientDistanceKm: 0,
  });
  const queueRef = useRef<TripPoint[]>(loadQueue());
  const flushTimerRef = useRef<number | null>(null);

  // Persist queue size changes
  useEffect(() => { saveQueue(queueRef.current); }, [state.queued]);

  const appendPoint = useCallback((loc: BgLocation) => {
    const point: TripPoint = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      timestamp: loc.time,
    };
    const prev = queueRef.current.length ? queueRef.current[queueRef.current.length - 1] : null;
    queueRef.current.push(point);

    let addDist = 0;
    if (prev) {
      const R = 6371;
      const dLat = (point.latitude - prev.latitude) * Math.PI / 180;
      const dLon = (point.longitude - prev.longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(prev.latitude*Math.PI/180)*Math.cos(point.latitude*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      addDist = R * c;
    }

    setState(s => ({ ...s, lastPoint: point, queued: queueRef.current.length, clientDistanceKm: s.clientDistanceKm + addDist }));
  }, []);

  const flushQueue = useCallback(async () => {
    if (!tripId) return;
    if (!queueRef.current.length) return;
    const points = [...queueRef.current];
    try {
      await tripService.addRoutePointsBulk(points);
      queueRef.current = [];
      setState(s => ({ ...s, queued: 0 }));
    } catch (e: any) {
      console.warn('Flush failed, will retry', e?.message || e);
    }
  }, [tripId]);

  // Auto flush logic
  useEffect(() => {
    if (!state.active) return;
    if (flushTimerRef.current) window.clearInterval(flushTimerRef.current);
    flushTimerRef.current = window.setInterval(() => {
      if (navigator.onLine) flushQueue();
    }, FLUSH_INTERVAL_MS);
    return () => {
      if (flushTimerRef.current) window.clearInterval(flushTimerRef.current);
    };
  }, [state.active, flushQueue]);

  // Flush when returning to foreground (and attempt flush when hiding)
  useEffect(() => {
    if (!FLUSH_ON_FOREGROUND) return;
    const handler = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        flushQueue();
      } else if (document.visibilityState === 'hidden' && navigator.onLine) {
        flushQueue();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [flushQueue]);

  // Online event listener
  useEffect(() => {
    const handler = () => flushQueue();
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [flushQueue]);

  const start = useCallback(async () => {
    if (!tripId) {
      setState(s => ({ ...s, error: 'No active trip id' }));
      return;
    }
    try {
      const permRes = await requestLocationPermissions(false);
      setState(s => ({ ...s, permission: permRes?.location || 'unknown' }));
      await startBackgroundTracking((loc) => {
        appendPoint(loc);
        // Immediate flush if queue large
        if (queueRef.current.length >= FLUSH_POINT_THRESHOLD && navigator.onLine) flushQueue();
      }, { distanceFilter: 15 });
      setState(s => ({ ...s, active: true, error: null }));
      // Auto-escalate iOS permission after 30s if still when-in-use
      setTimeout(async () => {
        try {
          const advice = await evaluateIOSPermissionState();
          if (advice.status === 'wheninuse' && advice.canRequestAlways) {
            await escalateToAlwaysWithUX(async () => true);
          }
        } catch {/* ignore */}
      }, 30000);
    } catch (e: any) {
      setState(s => ({ ...s, error: e?.message || 'Failed to start tracking' }));
    }
  }, [tripId, appendPoint, flushQueue]);

  const escalateToAlways = useCallback(async () => {
    try {
      const permRes = await requestLocationPermissions(true);
      setState(s => ({ ...s, permission: permRes?.location || s.permission }));
    } catch (e) { /* ignore */ }
  }, []);

  const stop = useCallback(async () => {
    await stopBackgroundTracking();
    await flushQueue();
    setState(s => ({ ...s, active: false }));
  }, [flushQueue]);

  return { ...state, start, stop, escalateToAlways, flushQueue };
}
