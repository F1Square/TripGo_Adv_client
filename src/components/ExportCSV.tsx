import React, { useState } from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Download } from 'lucide-react';
import { useTrip } from '@/hooks/useTrip';
import { useToast } from '@/hooks/use-toast';

const ExportCSV: React.FC = () => {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [startDate, setStartDate] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const { exportTripsToCSVRange } = useTrip();
  const { toast } = useToast();

  const handleExport = async () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast({ title: 'Invalid range', description: 'Start date must be before end date', variant: 'destructive' });
      return;
    }
    await exportTripsToCSVRange(startDate, endDate);
    toast({ title: 'Exported', description: `CSV generated for ${startDate} to ${endDate}` });
  };

  return (
    <div>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5 text-primary" />
          <span>Export Trips to CSV</span>
        </CardTitle>
        <CardDescription>Choose a date range to export your completed trips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Start date</span>
            </Label>
            <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>End date</span>
            </Label>
            <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-6">
          <Button variant="gradient-primary" onClick={handleExport} className="w-full md:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default ExportCSV;
