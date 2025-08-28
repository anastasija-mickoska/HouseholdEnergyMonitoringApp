import './firebase';
import { AppRegistry } from 'react-native';
import App from './App';
import BackgroundFetch from 'react-native-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

const BackgroundTask = async (taskId) => {
  console.log('[HeadlessTask] Running background fetch');
  console.log('Task ID:', taskId);
  try {
    const { auth } = await import('./firebase');
    const householdId = await AsyncStorage.getItem('householdId');
    const token = await auth.currentUser?.getIdToken();

    if (!householdId || !token) {
      console.log('Missing householdId or token — skipping notification.');
      BackgroundFetch.finish(taskId);
      return;
    }
    await fetch(`https://household-energy-backend.ey.r.appspot.com/notifications/${householdId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    try {
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
    } catch (e) {
      console.warn('Notifee notification failed:', e.message);
    }
  } catch (err) {
    console.error('[HeadlessTask] Error:', err);
  }
  finally{
    BackgroundFetch.finish(taskId);
  }
};

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await import('./firebase');
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Reminder',
    body: remoteMessage.notification?.body || `Don't forget to log your electricity meter data today`,
    android: {
      channelId: 'high_importance_channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      pressAction: { id: 'default' },
    },
  });
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  await import('./firebase');
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'default') {
    console.log('Notification pressed in background');
  }
});

BackgroundFetch.registerHeadlessTask(BackgroundTask);
AppRegistry.registerComponent('main', () => App);
