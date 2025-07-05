import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminHomePage from '../pages/AdminHomePage.js';
import AddUsage from '../pages/AddUsage.js';
import ApplianceEnergyUsage from '../pages/ApplianceEnergyUsage.js';
import CreateHousehold from '../pages/CreateHousehold.js';
import ElectricityMeterUsage from '../pages/ElectricityMeterUsage.js';
import InsightsPage from '../pages/InsightsPage.js';
import JoinHousehold from '../pages/JoinHousehold.js';
import ManageUsageLimits from '../pages/ManageUsageLimits.js';
import NotificationsList from '../pages/NotificationsList.js';
import UserHomePage from '../pages/UserHomePage.js';
import WelcomePage from '../pages/WelcomePage.js';
import Login from '../pages/Login.js';
import Register from '../pages/Register.js';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Home" component={AdminHomePage} />
          <Stack.Screen name="Insights" component={InsightsPage} />
          <Stack.Screen name="Add Usage" component={AddUsage} />
          <Stack.Screen name="Notifications" component={NotificationsList} />
          <Stack.Screen name="Appliance Energy Usage" component={ApplianceEnergyUsage} />
          <Stack.Screen name="Electricity Meter Usage" component={ElectricityMeterUsage} />
          <Stack.Screen name="Join Household" component={JoinHousehold} />
          <Stack.Screen name="Create Household" component={CreateHousehold} />
          <Stack.Screen name="Manage Usage Limits" component={ManageUsageLimits} />
          <Stack.Screen name="Welcome" component={WelcomePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
