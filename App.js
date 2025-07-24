import 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomePage from './pages/AdminHomePage';
import AddUsage from './pages/AddUsage';
import ApplianceEnergyUsage from './pages/ApplianceEnergyUsage';
import CreateHousehold from './pages/CreateHousehold';
import ElectricityMeterUsage from './pages/ElectricityMeterUsage';
import InsightsPage from './pages/InsightsPage';
import JoinHousehold from './pages/JoinHousehold';
import ManageUsageLimits from './pages/ManageUsageLimits';
import NotificationsList from './pages/NotificationsList';
import UserHomePage from './pages/UserHomePage';
import WelcomePage from './pages/WelcomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './components/Logout';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useCallback, useEffect } from 'react';
import { View, StatusBar, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

const sendTokenToBackend = async (userId, fcmToken, token) => {
  const res = await fetch(`http://192.168.1.108:8000/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type' : 'application/json'
    },
    body: JSON.stringify({fcmToken: fcmToken})
  });
  const json = await res.json();
  if(json.error) {
    Alert.alert(json.error);
  }
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Roboto Flex': require('./assets/RobotoFlex.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'high_importance_channel',
        name: 'High Importance Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
    }
    createChannel();
  }, []);

  useEffect(() => {
    let unsubscribeTokenRefresh;

    async function setupFCM() {
      try {
        const userId = await AsyncStorage.getItem('id');
        const fetchedToken = await AsyncStorage.getItem('token');
        if (!userId || !fetchedToken) {
          return;
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log('Notification permission not granted');
          return;
        }

        const currentToken = await messaging().getToken();
        const storedToken = await AsyncStorage.getItem('fcmToken');

        if (currentToken && currentToken !== storedToken) {
          await sendTokenToBackend(userId, currentToken, fetchedToken);
          await AsyncStorage.setItem('fcmToken', currentToken);
        }

        unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
          await sendTokenToBackend(userId, newToken, fetchedToken);
          await AsyncStorage.setItem('fcmToken', newToken);
        });
      } catch (error) {
        console.warn('Error during FCM setup:', error);
      }
    }

    setupFCM();

    return () => {
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
    };
  }, []);

  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Notification',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'high_importance_channel',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          smallIcon: 'lightbulb',
          pressAction: { id: 'default' },
        },
      });
    });
    
    return () => {
      unsubscribeOnMessage();
    };
  }, []);


  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Admin Home" component={AdminHomePage} />
          <Stack.Screen name="User Home" component={UserHomePage} />
          <Stack.Screen name="Insights" component={InsightsPage} />
          <Stack.Screen name="Add Usage" component={AddUsage} />
          <Stack.Screen name="Notifications" component={NotificationsList} />
          <Stack.Screen name="Appliance Energy Usage" component={ApplianceEnergyUsage} />
          <Stack.Screen name="Electricity Meter Usage" component={ElectricityMeterUsage} />
          <Stack.Screen name="Join Household" component={JoinHousehold} />
          <Stack.Screen name="Create Household" component={CreateHousehold} />
          <Stack.Screen name="Manage Usage Limits" component={ManageUsageLimits} />
          <Stack.Screen name="Welcome" component={WelcomePage} />
          <Stack.Screen name="Logout" component={Logout} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;
