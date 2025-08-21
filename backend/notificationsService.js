const {db, admin} = require('./config/firebaseConfig');
const { checkIfTodayEntryExists } = require('./firestoreService');

const sendPushNotification = async (userFcmToken, title, body, data = {}) => {
  try {
    const message = {
      token: userFcmToken,
      notification: {
        title,
        body,
      },
      android: {
        priority: "high",
        notification: {
          channelId: "high_importance_channel",
          sound: "default",
        },
      },
      data,
    };
    await admin.messaging().send(message);
    return true;

  } catch (error) {
    if (
      error.code === 'messaging/invalid-registration-token' ||
      error.code === 'messaging/registration-token-not-registered'
    ) {
      console.warn(`Invalid token detected and skipped: ${userFcmToken}`);
      return false;
    }

    console.error("Unexpected error sending notification:", error);
    throw error; 
  }
};

const addNotification = async(householdId, tokens, title, notification) => {
    try {
        await db.collection('Notifications').add({
            householdId,
            tokens,
            title,
            notification,
            date: new Date()
        });
    } catch(error) {
        console.error('Error adding notification to database!', error);
        throw error;
    }
};

const getNotificationsForHousehold = async(householdId) => {
    try{
        const snapshot = await db.collection('Notifications').where('householdId' , '==', householdId).orderBy('date','desc').get();
        const notifications = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        return notifications;
    }
    catch(error) {
        console.error('Error getting notifications for this household!', error);
        throw error;
    }
};

const setUserFcmToken = async(userId, token) => {
    try{
        const doc = await db.collection('users').doc(userId).get();
        if(!doc.exists) {
            throw new Error('User with this ID does not exist!');
        }
        await db.collection('users').doc(userId).update({fcmToken: token});
    }
    catch(error) {
        console.error('Error setting fcm token for this user!', error);
        throw error;       
    }
};

const checkEntriesAndNotify = async (householdId, tokens, title, body) => {
  const now = new Date();
  const day = now.getDay(); 
  const date = now.getDate(); 
  const hour = now.getHours();

  const shouldSend = (day === 1 || date === 1) && hour >= 16 && hour < 18;

  if (shouldSend) {
    const hasEntry = await checkIfTodayEntryExists(householdId);
    if (!hasEntry) {
      try {
        for (const token of tokens) {
          await sendPushNotification(token, title, body, {});
        }
      } catch (err) {
        console.error("Unexpected error sending notification:", err);
        throw err;
      }
    }
  }
};


module.exports = {
    sendPushNotification,
    addNotification,
    getNotificationsForHousehold,
    setUserFcmToken,
    checkEntriesAndNotify
};
