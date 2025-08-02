import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';

const BackgroundTask = async (taskId) => {
  console.log('[HeadlessTask] Running background fetch');

  try {
    const householdId = await AsyncStorage.getItem('householdId');
    const token = await AsyncStorage.getItem('token');

    if (!householdId || !token) {
      console.log('Missing householdId or token — skipping notification.');
      BackgroundFetch.finish(taskId);
      return;
    }

    const res = await fetch(`http://192.168.1.108:8000/notifications/${householdId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();

    await notifee.displayNotification({
      title: 'Reminder',
      body: `Don't forget to log your electricity meter data today`,
      android: {
        channelId: 'high_importance_channel',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        pressAction: { id: 'default' },
      },
    });
  } catch (err) {
    console.error('[HeadlessTask] Error:', err);
  }

  console.log('[HeadlessTask] Finished');
  BackgroundFetch.finish(taskId);
};

BackgroundFetch.registerHeadlessTask(BackgroundTask);

AppRegistry.registerComponent(appName, () => App);
