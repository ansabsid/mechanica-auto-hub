
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    appointments: true,
    partAvailability: false,
    promotions: false,
    serviceReminders: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    // In a real implementation, this would save notification preferences to the user's profile
    toast.success("Notification preferences saved");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Notification Categories</h3>
          <p className="text-sm text-muted-foreground">
            Choose which notifications you want to receive
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="order-updates">Order Updates</Label>
              <p className="text-xs text-muted-foreground">
                Notifications about your order status and delivery updates
              </p>
            </div>
            <Switch 
              id="order-updates" 
              checked={notifications.orderUpdates} 
              onCheckedChange={() => handleToggle("orderUpdates")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointments">Appointments</Label>
              <p className="text-xs text-muted-foreground">
                Appointment confirmations and reminders
              </p>
            </div>
            <Switch 
              id="appointments" 
              checked={notifications.appointments} 
              onCheckedChange={() => handleToggle("appointments")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="part-availability">Part Availability</Label>
              <p className="text-xs text-muted-foreground">
                Alerts when parts you're interested in become available
              </p>
            </div>
            <Switch 
              id="part-availability" 
              checked={notifications.partAvailability} 
              onCheckedChange={() => handleToggle("partAvailability")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promotions">Promotions</Label>
              <p className="text-xs text-muted-foreground">
                Special offers, discounts, and promotional information
              </p>
            </div>
            <Switch 
              id="promotions" 
              checked={notifications.promotions} 
              onCheckedChange={() => handleToggle("promotions")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="service-reminders">Service Reminders</Label>
              <p className="text-xs text-muted-foreground">
                Reminders for vehicle service and maintenance
              </p>
            </div>
            <Switch 
              id="service-reminders" 
              checked={notifications.serviceReminders} 
              onCheckedChange={() => handleToggle("serviceReminders")}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Notification Channels</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive notifications
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={notifications.emailNotifications} 
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive notifications in your web browser or mobile app
              </p>
            </div>
            <Switch 
              id="push-notifications" 
              checked={notifications.pushNotifications} 
              onCheckedChange={() => handleToggle("pushNotifications")}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
