import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppointments } from "@/hooks/useAppointments";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  garageId: z.string({
    required_error: "Please select a garage",
  }),
  serviceType: z.string({
    required_error: "Please select a service type",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof formSchema>;

interface AppointmentBookingFormProps {
  onSuccess?: () => void;
}

// Mock garages data - in a real app, this would come from API
const garages = [
  { id: "1", name: "AutoCare Dubai", location: "Dubai Marina" },
  { id: "2", name: "BrakeMax", location: "Deira" },
  { id: "3", name: "SparkTech Auto", location: "Al Quoz" },
];

// Mock service types - in a real app, this would come from API
const serviceTypes = [
  { id: "oil-change", name: "Oil Change" },
  { id: "brake-service", name: "Brake Service" },
  { id: "full-service", name: "Full Car Service" },
  { id: "ac-service", name: "AC Service" },
  { id: "tire-change", name: "Tire Change" },
];

export const AppointmentBookingForm = ({ onSuccess }: AppointmentBookingFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { 
    availableSlots, 
    fetchAvailableSlots, 
    bookAppointment, 
    isLoading, 
    isBooking 
  } = useAppointments();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      garageId: "",
      serviceType: "",
      notes: "",
    },
  });
  
  // Watch for garage and service type changes to fetch available slots
  const garageId = form.watch("garageId");
  const serviceType = form.watch("serviceType");
  const date = form.watch("date");
  
  // Fetch available slots when garage, service type or date changes
  useEffect(() => {
    if (garageId && serviceType && date) {
      const formattedDate = format(date, "yyyy-MM-dd");
      fetchAvailableSlots(garageId, serviceType, formattedDate);
    }
  }, [garageId, serviceType, date]);
  
  const onSubmit = async (data: BookingFormValues) => {
    const formattedDate = format(data.date, "yyyy-MM-dd");
    const appointment = await bookAppointment(
      data.garageId,
      data.serviceType,
      formattedDate,
      data.time,
      data.notes
    );
    
    if (appointment && onSuccess) {
      onSuccess();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Service</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="garageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garage</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a garage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {garages.map((garage) => (
                        <SelectItem key={garage.id} value={garage.id}>
                          {garage.name} - {garage.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setSelectedDate(date);
                        }}
                        disabled={(date) => 
                          date < new Date() || 
                          date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!selectedDate || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoading 
                            ? "Loading available times..." 
                            : !selectedDate 
                              ? "Select a date first"
                              : availableSlots.length === 0
                                ? "No available times"
                                : "Select a time"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requests or information for the garage"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-mechanica-500 hover:bg-mechanica-600"
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Book Appointment"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
