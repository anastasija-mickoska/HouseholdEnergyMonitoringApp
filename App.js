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
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useCallback, useEffect, useRef } from 'react';
import { View, StatusBar, Alert, AppState } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import BackgroundFetch from 'react-native-background-fetch';
import {auth} from './firebase';
import { signOut } from 'firebase/auth';

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
  const [householdId, setHouseholdId] = useState(null);
  const [token, setToken] = useState(null);
  const appState = useRef(AppState.currentState);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    async function loadData() {
      await Font.loadAsync({
        'Roboto Flex': require('./assets/RobotoFlex.ttf'),
      });
      setFontsLoaded(true);
      const storedHouseholdId = await AsyncStorage.getItem('householdId');
      setHouseholdId(storedHouseholdId);
    }
    loadData();
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
        setToken(fetchedToken);
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
          pressAction: { id: 'default' },
        },
      });
    });
    
    return () => {
      unsubscribeOnMessage();
    };
  }, []);

  useEffect(() => {
    const initBackgroundFetch = async () => {
      BackgroundFetch.configure(
        {
          minimumFetchInterval: 60,
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
        },
        async (taskId) => {
            try {
              const res = await fetch(`http://192.168.1.108:8000/notifications/${householdId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (!res.ok) {
                console.warn('Notification fetch failed with status', res.status);
              }
            } catch (error) {
              console.warn('Notification fetch failed', error.message);
            } finally {
              BackgroundFetch.finish(taskId);
            }
        },
        (error) => {
          console.log('BackgroundFetch failed to start', error);
        }
      );

      BackgroundFetch.start();
    };

    initBackgroundFetch();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        const timestamp = Date.now().toString();
        await AsyncStorage.setItem('lastActiveTime', timestamp);
        console.log('Saved timestamp:', timestamp);
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkAutoLogout = async () => {
      const lastActiveStr = await AsyncStorage.getItem('lastActiveTime');
      if (!lastActiveStr) return;

      const lastActiveTime = parseInt(lastActiveStr, 10);
      const now = Date.now();
      const diffMinutes = (now - lastActiveTime) / 1000 / 60;
      if (diffMinutes >= AUTO_LOGOUT_MINUTES) {
        try {
          await signOut(auth);                
          await AsyncStorage.clear();       

          if (navigationRef.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
            console.log('Auto-logged out after background timeout');
          }
        } catch (error) {
          console.error('Auto logout error:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkAutoLogout();
      }
    });

    return () => {
      subscription.remove();
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
      <NavigationContainer ref={navigationRef}>
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
