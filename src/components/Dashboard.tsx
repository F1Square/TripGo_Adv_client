import React, { useState, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Car, 
  MapPin, 
  Clock, 
  TrendingUp, 
  User, 
  LogOut, 
  Play, 
  History,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTrip } from '@/hooks/useTrip';
import { useToast } from '@/hooks/use-toast';
import { roundDistanceKm } from '@/lib/utils';

// Lazy loaded heavy components
const NewTripForm = React.lazy(() => import('./NewTripForm'));
const ActiveTrip = React.lazy(() => import('./ActiveTrip'));
const TripHistory = React.lazy(() => import('./TripHistory'));
const ExportCSV = React.lazy(() => import('./ExportCSV'));
const UserProfile = React.lazy(() => import('./UserProfile'));

// Component loading spinner
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { currentTrip, isActive, tripHistory } = useTrip();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentOdometer, setCurrentOdometer] = useState(
    localStorage.getItem('trip_tracker_odometer') || '50000'
  );
  const [showProfile, setShowProfile] = useState(false);
  const [tabValue, setTabValue] = useState<string>(isActive ? 'history' : 'new-trip');

  useEffect(() => {
    // Auto-switch to history when trip becomes active, back to new-trip when inactive
    setTabValue(isActive ? 'history' : 'new-trip');
  }, [isActive]);

  const updateOdometer = (value: string) => {
    setCurrentOdometer(value);
    localStorage.setItem('trip_tracker_odometer', value);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Trip Tracker</h1>
                <p className="text-sm text-muted-foreground">Business Travel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2 h-auto hover:bg-muted"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user?.name}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setShowProfile(true)}>
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Odometer */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Current Odometer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{currentOdometer.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">kilometers</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newReading = prompt('Enter new odometer reading:', currentOdometer);
                    if (newReading && !isNaN(Number(newReading))) {
                      updateOdometer(newReading);
                    }
                  }}
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trip Status */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Trip Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge 
                    variant={isActive ? "default" : "secondary"}
                    className={isActive ? "bg-success text-success-foreground pulse-success" : ""}
                  >
                    {isActive ? 'Trip Active' : 'No Active Trip'}
                  </Badge>
                  {currentTrip && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentTrip.purpose}
                    </p>
                  )}
                </div>
                {isActive && (
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">
                      {roundDistanceKm(currentTrip?.distance || 0)} km
                    </p>
                    <p className="text-xs text-muted-foreground">distance</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trips</span>
                  <span className="font-medium">{tripHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="font-medium">
                    {roundDistanceKm(tripHistory.reduce((sum, trip) => sum + trip.distance, 0))} km
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Trip Section */}
        {isActive && (
          <Suspense fallback={<ComponentLoader />}>
            <ActiveTrip />
          </Suspense>
        )}

        {/* Main Content - Always Show Tabs */}
        <Card className="glass-card">
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/30">
              <TabsTrigger 
                value="new-trip" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center space-x-2"
                disabled={isActive}
              >
                <Play className="w-4 h-4" />
                <span>New Trip</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger 
                value="export" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>Export CSV</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-trip" className="mt-6">
              {!isActive && (
                <Suspense fallback={<ComponentLoader />}>
                  <NewTripForm currentOdometer={Number(currentOdometer)} />
                </Suspense>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Suspense fallback={<ComponentLoader />}>
                <TripHistory />
              </Suspense>
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <Suspense fallback={<ComponentLoader />}>
                <ExportCSV />
              </Suspense>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Profile Dialog Modal */}
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>User Profile</span>
              </DialogTitle>
            </DialogHeader>
            <Suspense fallback={<ComponentLoader />}>
              <UserProfile />
            </Suspense>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;