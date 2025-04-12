
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.mechanicaautohub',
  appName: 'mechanica-auto-hub',
  webDir: 'dist',
  server: {
    url: 'https://2d72b7aa-a39a-447a-ba13-099dec9a2f3c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https'
  },
  // Add iOS specific configurations
  ios: {
    contentInset: 'always',
    backgroundColor: '#ffffff',
    scheme: 'mechanica-auto-hub'
  },
  // Add Android specific configurations  
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: true
  }
};

export default config;
