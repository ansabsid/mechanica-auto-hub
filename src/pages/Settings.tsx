
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import ProfileSettings from "@/components/settings/ProfileSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import AccountSettings from "@/components/settings/AccountSettings";
import { User, Shield, Bell, PaintBucket } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="profile" className="flex gap-2 items-center">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex gap-2 items-center">
            <PaintBucket className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex gap-2 items-center">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex gap-2 items-center">
            <Shield className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "profile" && "Profile Settings"}
              {activeTab === "appearance" && "Appearance Settings"}
              {activeTab === "notifications" && "Notification Preferences"}
              {activeTab === "account" && "Account Settings"}
            </CardTitle>
            <CardDescription>
              {activeTab === "profile" && "Manage your personal information"}
              {activeTab === "appearance" && "Customize how BookMyParts looks"}
              {activeTab === "notifications" && "Control notifications and alerts"}
              {activeTab === "account" && "Manage your account security and privacy"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>
            <TabsContent value="appearance" className="mt-0">
              <AppearanceSettings />
            </TabsContent>
            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="account" className="mt-0">
              <AccountSettings />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Settings;
