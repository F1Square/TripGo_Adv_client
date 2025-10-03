import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  Gauge, 
  Square, 
  Map,
  Navigation,
  Signal,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';
import { useToast } from '@/hooks/use-toast';

// Lazy load the heavy TripMap component
const TripMap = React.lazy(() => import('./TripMap'));

// Map loading component
const MapLoader = () => (
  <div className="h-64 w-full rounded-b-lg overflow-hidden bg-muted/50 flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Loading map...</span>
    </div>
  </div>
);

const ActiveTrip = () => {
  const { currentTrip, endTrip, position, gpsError, backgroundSupport } = useTrip();
  const { toast } = useToast();
  
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isAppVisible, setIsAppVisible] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Track app visibility for background tracking indicators
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Update last position time
  useEffect(() => {
    if (position) {
      setLastUpdateTime(new Date(position.timestamp));
    }
  }, [position]);

  if (!currentTrip) return null;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getGPSAccuracy = () => {
    if (!position) return 'No signal';
    if (position.accuracy <= 10) return 'Excellent';
    if (position.accuracy <= 50) return 'Good';
    if (position.accuracy <= 100) return 'Fair';
    return 'Poor';
  };

  const getGPSColor = () => {
    if (!position) return 'text-destructive';
    if (position.accuracy <= 10) return 'text-success';
    if (position.accuracy <= 50) return 'text-primary';
    if (position.accuracy <= 100) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getTimeSinceLastUpdate = () => {
    if (!lastUpdateTime) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - lastUpdateTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return `${Math.floor(diffSecs / 3600)}h ago`;
  };

  // current speed card removed per requirement

  const handleEndTrip = async () => {
    // Auto-calculate ending odometer based on GPS distance
    const calculatedEndOdometer = currentTrip.startOdometer + currentTrip.distance;
    
    const result = await endTrip(calculatedEndOdometer);
    
    if (result.success) {
      toast({
        title: "Trip completed!",
        description: `Trip ended successfully. GPS Distance: ${result.trip?.distance.toFixed(2)} km`,
      });
      setIsEndDialogOpen(false);
    } else {
      toast({
        title: "Failed to end trip",
        description: result.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Trip Header */}
      <Card className="glass-card border-success/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
              <span>Trip in Progress</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="bg-success text-success-foreground">
                LIVE
              </Badge>
              {!isAppVisible && backgroundSupport && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Background
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{currentTrip.purpose}</p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {isAppVisible ? (
                <><Eye className="w-4 h-4" /> Active</>
              ) : (
                <><EyeOff className="w-4 h-4" /> Background</>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Stats */}
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="text-lg font-bold text-foreground">
                    {currentTrip.distance.toFixed(2)} km
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {currentTrip.route.length} points
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-bold text-foreground">
                  {formatDuration(currentTrip.duration)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Speed card removed */}

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Signal className={`w-5 h-5 ${getGPSColor()}`} />
                <div>
                  <p className="text-sm text-muted-foreground">GPS Quality</p>
                  <p className={`text-lg font-bold ${getGPSColor()}`}>
                    {getGPSAccuracy()}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {position ? `±${position.accuracy.toFixed(0)}m` : 'No signal'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GPS Status and Background Tracking Info */}
      <Card className="glass-card border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Last GPS Update</p>
              <p className="font-medium">{getTimeSinceLastUpdate()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Background Support</p>
              <p className="font-medium">
                {backgroundSupport ? 'Enabled' : 'Limited'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tracking Status</p>
              <p className="font-medium flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${position ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{position ? 'Active' : 'Inactive'}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Error Alert */}
      {gpsError && (
        <Card className="glass-card border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Signal className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">GPS Issue</p>
                <p className="text-sm text-muted-foreground">{gpsError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Background Tracking Tips */}
      {backgroundSupport && (
        <Card className="glass-card border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Background Tracking Enabled
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  This app will continue tracking your location even when minimized. 
                  Keep your phone charged for accurate distance measurements throughout your entire trip.
                </p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  <p>• GPS tracking continues in background</p>
                  <p>• Screen stays awake to prevent interruption</p>
                  <p>• Distance calculation remains accurate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Map className="w-5 h-5 text-primary" />
            <span>Live Route</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMapFullscreen(true)}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Suspense fallback={<MapLoader />}>
            <div className="h-64 w-full rounded-b-lg overflow-hidden">
              <TripMap 
                trip={currentTrip}
                currentPosition={position}
                height="256px"
              />
            </div>
          </Suspense>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col space-y-3">
        <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="gradient-danger"
              size="xl"
              className="w-full"
            >
              <Square className="w-5 h-5 mr-2" />
              End Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>End Trip</DialogTitle>
              <DialogDescription>
                Review your trip details before completing. The distance has been automatically calculated using GPS tracking.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Starting Odometer</Label>
                  <p className="text-lg font-semibold text-foreground">
                    {currentTrip.startOdometer.toLocaleString()} km
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Calculated Ending Odometer</Label>
                  <p className="text-lg font-semibold text-foreground">
                    {(currentTrip.startOdometer + currentTrip.distance).toLocaleString()} km
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="font-medium text-green-800 dark:text-green-200">GPS-Tracked Distance</p>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {currentTrip.distance.toFixed(2)} km
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Trip Summary:</strong><br />
                  Duration: {formatDuration(currentTrip.duration)}<br />
                  Purpose: {currentTrip.purpose}<br />
                  GPS Points Collected: {currentTrip.route.length}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEndDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient-danger"
                onClick={handleEndTrip}
              >
                Complete Trip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fullscreen Map Modal */}
      <Dialog open={isMapFullscreen} onOpenChange={setIsMapFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <Suspense fallback={<MapLoader />}>
            <div className="h-full w-full">
              <TripMap 
                trip={currentTrip}
                currentPosition={position}
                height="100%"
                fullscreen
              />
            </div>
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveTrip;