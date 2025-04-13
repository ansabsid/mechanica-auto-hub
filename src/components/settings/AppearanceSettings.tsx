
import React, { useEffect, useState } from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { Card } from "@/components/ui/card";

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const handleSave = () => {
    setTheme(selectedTheme);
    toast.success(`Theme changed to ${selectedTheme} mode`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground">
            Choose your preferred theme mode for BookMyParts
          </p>
        </div>

        <RadioGroup 
          value={selectedTheme} 
          onValueChange={setSelectedTheme}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
        >
          <div>
            <RadioGroupItem
              value="light"
              id="theme-light"
              className="peer sr-only"
            />
            <Label
              htmlFor="theme-light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 hover:border-gray-200 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Sun className="mb-3 h-6 w-6 text-orange-500" />
              <div className="font-semibold">Light</div>
              <div className="text-xs text-muted-foreground mt-1">
                Light mode theme
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="dark"
              id="theme-dark"
              className="peer sr-only"
            />
            <Label
              htmlFor="theme-dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-black p-4 hover:bg-gray-900 hover:border-gray-700 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Moon className="mb-3 h-6 w-6 text-indigo-400" />
              <div className="font-semibold text-white">Dark</div>
              <div className="text-xs text-gray-400 mt-1">
                Dark mode theme
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="system"
              id="theme-system"
              className="peer sr-only"
            />
            <Label
              htmlFor="theme-system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-gradient-to-br from-white to-gray-900 p-4 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-800 hover:border-gray-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <MonitorSmartphone className="mb-3 h-6 w-6 text-blue-500" />
              <div className="font-semibold bg-gradient-to-br from-black to-white bg-clip-text text-transparent">System</div>
              <div className="text-xs text-gray-600 mt-1">
                Follow system
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Display Options</h3>
          <p className="text-sm text-muted-foreground">
            Customize how BookMyParts displays content
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduce animations</Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations for a more comfortable experience
              </p>
            </div>
            <Switch id="reduced-motion" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High contrast</Label>
              <p className="text-xs text-muted-foreground">
                Increase contrast for better readability
              </p>
            </div>
            <Switch id="high-contrast" />
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

export default AppearanceSettings;
