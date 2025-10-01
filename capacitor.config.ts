import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b204c131203743e282f3fdc04eed2ba6',
  appName: 'rodil-stock-flow',
  webDir: 'dist',
  server: {
    url: 'https://b204c131-2037-43e2-82f3-fdc04eed2ba6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      cameraDirection: 'back'
    }
  }
};

export default config;
