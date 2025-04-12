
import { useEffect, useState } from 'react';

interface CapacitorStatus {
  isCapacitor: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  platform: string | null;
}

export const useCapacitor = (): CapacitorStatus => {
  const [status, setStatus] = useState<CapacitorStatus>({
    isCapacitor: false,
    isIOS: false,
    isAndroid: false,
    platform: null
  });

  useEffect(() => {
    const checkCapacitor = async () => {
      try {
        // Dynamically import Capacitor to avoid issues in web context
        const { Capacitor } = await import('@capacitor/core');
        
        const isCapacitor = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();
        
        setStatus({
          isCapacitor,
          isIOS: platform === 'ios',
          isAndroid: platform === 'android',
          platform
        });
        
        console.log('Running on:', isCapacitor ? `Capacitor (${platform})` : 'Web');
      } catch (error) {
        console.log('Capacitor not available, running on web');
      }
    };

    checkCapacitor();
  }, []);

  return status;
};
