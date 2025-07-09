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
import {View, StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const fetchFonts = () => {
  return Font.loadAsync({
    'Roboto Flex': require('./assets/RobotoFlex.ttf'),
  });
};
const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync(); 

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    async function loadRole() {
      try {
        const storedRole = await AsyncStorage.getItem('role');
        setRole(storedRole);
      } catch (error) {
        console.error("Failed to load role:", error);
      }
    };
    loadRole();
    async function loadFonts() {
      await Font.loadAsync({
        'Roboto Flex': require('./assets/RobotoFlex.ttf'),
      });
      setFontsLoaded(true);
    }

    loadFonts();
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
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={(role && role === 'Admin') ? AdminHomePage : UserHomePage} />
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
