import React, { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Download, 
  Trash2, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Clock,
  Eye,
  FileText
} from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';
import { roundDistanceKm } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Lazy load the heavy TripMap component
const TripMap = React.lazy(() => import('./TripMap'));

// Map loading component
const MapLoader = () => (
  <div className="h-64 w-full rounded-lg overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Loading map...</span>
    </div>
  </div>
);

const TripHistory = React.memo(() => {
  const { tripHistory, deleteTrip, exportTripsToCSV } = useTrip();
  const { toast } = useToast();
  
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const handleDeleteTrip = async (tripId: string) => {
    const result = await deleteTrip(tripId);
    setTripToDelete(null);
    
    if (result.success) {
      toast({
        title: "Trip deleted",
        description: "The trip has been removed from your history",
      });
    } else {
      toast({
        title: "Failed to delete trip",
        description: result.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    if (tripHistory.length === 0) {
      toast({
        title: "No trips to export",
        description: "Complete some trips first to generate a report",
        variant: "destructive",
      });
      return;
    }

    exportTripsToCSV();
    toast({
      title: "Export successful",
      description: "Your trip data has been downloaded as a CSV file",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Fallback: compute duration from timestamps if server value is missing/zero
  const getDurationSeconds = (trip: any) => {
    const hasDuration = typeof trip.duration === 'number' && trip.duration > 0;
    if (hasDuration) return trip.duration;
    const start = new Date(trip.startTime || trip.createdAt).getTime();
    const end = trip.endTime ? new Date(trip.endTime).getTime() : undefined;
    if (!end || !start) return 0;
    const diff = Math.floor((end - start) / 1000);
    return diff > 0 ? diff : 0;
  };

  const viewTripDetails = (trip: any) => {
    setSelectedTrip(trip);
    setIsDetailModalOpen(true);
  };

  if (tripHistory.length === 0) {
    return (
      <div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Trip History</span>
          </CardTitle>
          <CardDescription>
            Your completed business trips will appear here
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No trips yet</h3>
              <p className="text-muted-foreground">
                Start your first business trip to begin tracking expenses
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    );
  }

  return (
    <div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Trip History</span>
            </CardTitle>
            <CardDescription>
              {tripHistory.length} completed trip{tripHistory.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {tripHistory.map((trip) => (
            <Card key={trip._id || trip.id} className="glass-card border-card-border hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground truncate pr-2">
                        {trip.purpose}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(trip.startTime || trip.createdAt), 'MMM dd, yyyy')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Distance:</span>
                        <span className="font-medium">{roundDistanceKm(trip.distance)} km</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{formatDuration(getDurationSeconds(trip))}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Odometer:</span>
                        <span className="font-medium">
                          {trip.startOdometer.toLocaleString()} - {trip.endOdometer?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewTripDetails(trip)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTripToDelete(trip._id || trip.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      {/* Trip Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
          {selectedTrip && (
            <>
              <DialogHeader>
                <DialogTitle>Trip Details</DialogTitle>
                <DialogDescription>
                  Complete information for trip on {format(new Date(selectedTrip.startTime || selectedTrip.createdAt), 'MMMM dd, yyyy')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Trip Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Trip Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purpose:</span>
                          <span className="font-medium">{selectedTrip.purpose}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {format(new Date(selectedTrip.startTime || selectedTrip.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start Time:</span>
                          <span className="font-medium">
                            {format(new Date(selectedTrip.startTime || selectedTrip.createdAt), 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End Time:</span>
                          <span className="font-medium">
                            {selectedTrip.endTime ? format(new Date(selectedTrip.endTime), 'h:mm a') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Trip Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Distance:</span>
                          <span className="font-medium">{roundDistanceKm(selectedTrip.distance)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{formatDuration(getDurationSeconds(selectedTrip))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start Odometer:</span>
                          <span className="font-medium">{selectedTrip.startOdometer.toLocaleString()} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End Odometer:</span>
                          <span className="font-medium">
                            {selectedTrip.endOdometer?.toLocaleString() || 'N/A'} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Route Map */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4">Route Map</h4>
                  <Suspense fallback={<MapLoader />}>
                    <div className="h-64 w-full rounded-lg overflow-hidden border border-border">
                      <TripMap 
                        trip={selectedTrip}
                        height="256px"
                        showFullRoute
                      />
                    </div>
                  </Suspense>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTripToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="gradient-danger"
              onClick={() => tripToDelete && handleDeleteTrip(tripToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

TripHistory.displayName = 'TripHistory';

export default TripHistory;