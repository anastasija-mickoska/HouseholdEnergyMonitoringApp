const {db, admin} = require('./config/firebaseConfig');

const sendPushNotification = async (userFcmToken, title, body, data = {}) => {
    const message = {
        token: userFcmToken,
        notification: {
            title: title,
            body: body
        },
        data: data
    };
    await admin.messaging().send(message);
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
        const snapshot = await db.collection('Notifications').where('householdId' , '==', householdId).get();
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

module.exports = {
    sendPushNotification,
    addNotification,
    getNotificationsForHousehold,
    setUserFcmToken
};
