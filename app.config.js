import fs from 'fs';
import path from 'path';

export default ({ config }) => {
  const googleServices = process.env.GOOGLE_SERVICES_JSON;

  if (!googleServices) {
    console.warn('GOOGLE_SERVICES_JSON environment variable is missing — Firebase will fail to initialize.');
  } else {
    try {
      const decoded = Buffer.from(googleServices, 'base64').toString('utf-8');
      const targetPath = path.join(__dirname, 'android', 'app', 'google-services.json');
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, decoded);
      console.log('google-services.json created at', targetPath);
    } catch (err) {
      console.error('Failed to write google-services.json:', err);
    }
  }

  return {
    ...config,
    expo: {
      name: 'HouseholdEnergyMonitoringApp',
      slug: 'HouseholdEnergyMonitoringApp',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/logo.png',
      userInterfaceStyle: 'light',
      newArchEnabled: true,
      extra: {
        firebase: {
          projectId: 'householdenergymonitoringapp'
        },
        eas: {
          projectId: '6658b1b1-b0bf-4239-88ff-8990c454ce48'
        }
      },
      splash: {
        image: './assets/images/lightbulb.png',
        resizeMode: 'contain',
        backgroundColor: '#f3f3f3'
      },
      ios: {
        supportsTablet: true
      },
      android: {
        usesCleartextTraffic: true,
        adaptiveIcon: {
          foregroundImage: './assets/images/lightbulb.png',
          backgroundColor: '#f3f3f3'
        },
        edgeToEdgeEnabled: true,
        permissions: [
          'NOTIFICATIONS'
        ],
        package: 'com.anastasija_m.HouseholdEnergyMonitoringApp',
        googleServicesFile: './google-services.json'
      },
      web: {
        favicon: './assets/images/logo.png'
      },
      scheme: 'householdenergy',
      plugins: [
        'react-native-background-fetch'
      ]
    }
  };
};
