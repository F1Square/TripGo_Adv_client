import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Play, Settings } from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';
import { useToast } from '@/hooks/use-toast';

interface NewTripFormProps {
  currentOdometer: number;
}

const NewTripForm: React.FC<NewTripFormProps> = ({ currentOdometer }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    startOdometer: currentOdometer.toString(),
    date: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { startTrip } = useTrip();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purpose.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a trip purpose",
        variant: "destructive",
      });
      return;
    }

    if (formData.purpose.trim().length < 3) {
      toast({
        title: "Purpose too short",
        description: "Trip purpose must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    const odometerValue = Number(formData.startOdometer);
    if (isNaN(odometerValue) || odometerValue < 0) {
      toast({
        title: "Invalid odometer reading",
        description: "Please enter a valid odometer reading",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await startTrip(formData.purpose, odometerValue);
      
      if (result.success) {
        toast({
          title: "Trip started!",
          description: "GPS tracking is now active",
        });
        
        // Reset form
        setFormData({
          purpose: '',
          startOdometer: currentOdometer.toString(),
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        toast({
          title: "Failed to start trip",
          description: result.error || "Please check your location permissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Play className="w-5 h-5 text-primary" />
          <span>Start New Trip</span>
        </CardTitle>
        <CardDescription>
          Begin tracking a new business trip with GPS monitoring
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Date</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-background/80"
                required
              />
            </div>

            {/* Odometer */}
            <div className="space-y-2">
              <Label htmlFor="odometer" className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>Starting Odometer (km)</span>
              </Label>
              <Input
                id="odometer"
                type="number"
                value={formData.startOdometer}
                onChange={(e) => setFormData({ ...formData, startOdometer: e.target.value })}
                placeholder="50000"
                className="bg-background/80"
                required
                min="0"
              />
            </div>
          </div>

          {/* Trip Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>Trip Purpose</span>
            </Label>
            <Textarea
              id="purpose"
              placeholder="e.g., Client meeting at downtown office, Site visit to construction project, Business conference in Toronto..."
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="bg-background/80 min-h-[100px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              Provide a clear description for expense reporting purposes
            </p>
          </div>

          {/* Location Permission Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-primary">GPS Tracking Required</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This app requires location permissions to accurately track your business trip route and calculate distances for expense reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient-success"
            size="xl"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Starting Trip...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Trip
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </div>
  );
};

export default NewTripForm;