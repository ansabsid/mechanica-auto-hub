
import React from 'react';
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InstallationRequest } from "@/hooks/useInstallationRequests";

interface SchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: InstallationRequest | null;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
  onConfirm: () => void;
  availableTimes: string[];
  formatTimeDisplay: (time: string) => string;
}

export const SchedulingDialog: React.FC<SchedulingDialogProps> = ({
  open,
  onOpenChange,
  request,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  onConfirm,
  availableTimes,
  formatTimeDisplay
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Installation</DialogTitle>
          <DialogDescription>
            Select date and time for installation
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-medium">Select Date</h4>
            <div className="border rounded-md p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onSelectDate}
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                className="mx-auto"
              />
            </div>
          </div>
          
          {selectedDate && (
            <div className="flex flex-col space-y-2">
              <h4 className="text-sm font-medium">Select Time</h4>
              <Select onValueChange={onSelectTime} value={selectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTimeDisplay(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!selectedDate || !selectedTime}
          >
            Confirm Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
