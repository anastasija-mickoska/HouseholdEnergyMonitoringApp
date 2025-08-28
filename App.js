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
//import { signOut } from 'firebase/auth';

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

const sendTokenToBackend = async (userId, fcmToken, token) => {
  const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/users/${userId}`, {
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
//  const appState = useRef(AppState.currentState);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    async function loadData() {
      await Font.loadAsync({
        'Roboto Flex': require('./assets/RobotoFlex.ttf'),
      });
      setFontsLoaded(true);
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
      try {
        await BackgroundFetch.configure(
          {
            minimumFetchInterval: 15,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: true,
            requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
          },
          async (taskId) => {
            try {
              const householdId = await AsyncStorage.getItem('householdId');
              const token = await auth.currentUser.getIdToken();
              console.log('Background notification task fetched now');
              const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/notifications/${householdId}`, {
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
              console.warn('Notification fetch error:', error.message);
            } finally {
              console.log('Background notification task finishing now');
              BackgroundFetch.finish(taskId);
            }
          },
          (error) => {
            console.error('BackgroundFetch failed to configure:', error);
          }
        );
      } catch (err) {
        console.warn('BackgroundFetch error:', err);
      }
    };

    initBackgroundFetch();
  }, []);

  // useEffect(() => {
  //   const handleAppStateChange = async (nextAppState) => {
  //     if (
  //       appState.current === 'active' &&
  //       (nextAppState === 'background' || nextAppState === 'inactive')
  //     ) {
  //       const timestamp = Date.now().toString();
  //       try {
  //         await AsyncStorage.setItem('lastActiveTime', timestamp);
  //         console.log('Saved timestamp:', timestamp);
  //       } catch (err) {
  //         console.warn('Failed to save timestamp', err);
  //       }
  //     }
  //     if (nextAppState === 'active') {
  //       const lastActiveStr = await AsyncStorage.getItem('lastActiveTime');
  //       if (lastActiveStr) {
  //         const lastActiveTime = parseInt(lastActiveStr, 10);
  //         const now = Date.now();
  //         const diffMinutes = (now - lastActiveTime) / 1000 / 60;

  //         if (diffMinutes >= 360) {
  //           try {
  //             await signOut(auth);
  //             await AsyncStorage.clear();
  //             if (navigationRef.isReady()) {
  //               navigationRef.reset({
  //                 index: 0,
  //                 routes: [{ name: 'Login' }],
  //               });
  //             }
  //           } catch (error) {
  //             console.error('Auto logout error:', error);
  //           }
  //         }
  //       }
  //     }

  //     appState.current = nextAppState;
  //   };
  //   const subscription = AppState.addEventListener('change', handleAppStateChange);

  //   return () => {
  //     subscription.remove();
  //   };
  // }, []);


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
