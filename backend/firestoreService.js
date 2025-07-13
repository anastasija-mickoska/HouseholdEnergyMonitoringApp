//all firestore operations here
const { db } = require('./config/firebaseConfig');

const getAllHouseholds = async () => {
    try {
        const snapshot = await db.collection('Households').get();
        const households = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return households;
    }
    catch(error) {
        console.error('Error getting households!', error);
        throw error;
    }
};

const getHouseholdById = async(id) => {
    try {
        const household = await db.collection('Households').doc(id).get();
        if(!household.exists) {
            throw new Error('Household with this ID does not exist!');
        }
        return {id:household.id, ...household.data()};
    }
    catch(error) {
        console.error('Error finding household by ID!', error);
        throw error;
    }
};

const createHousehold = async(household) => {
    try {
        const doc = await db.collection('Households').add(household);
        console.log('Created document with ID ', doc.id);
    }
    catch(error) {
        console.error('Error creating household!', error);
        throw error;
    }
};

const joinHousehold = async(householdId, userId, code, name) => {
    try {
        const doc = await db.collection('Households').doc(householdId).get();
        if(!doc.exists()) {
            throw new Error('Household with this ID does not exist!');
        }
        const data = doc.data();
        const householdCode = data.householdCode;
        const householdName = data.householdName;
        if(name != householdName || householdCode != code) {
            throw new Error('Invalid household data!');
        }
        const updatedMembers = data.members?.includes(userId)
        ? data.members
        : [...(data.members || []), userId];

        await db.collection('Households').doc(householdId).update({members: updatedMembers});
    }
    catch(error) {
        console.error('Error joining household!', error);
        throw error;
    }
};

const getAllUsers = async() => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({id:doc.id, ...doc.data()}));
        return users;
    }
    catch(error) {
        console.error('Error getting users!', error);
        throw error;
    }
}

const getUserById = async (id) => {
    try {
        const user = await db.collection('users').doc(id).get();
        if(!user.exists()) {
            throw new Error('User with this ID does not exist!');
        }
        return {id:user.id, ...user.data()};
    }
    catch(error) {
        console.error('Error getting user by ID!', error);
        throw error;
    }

};

const getElectricityMeterUsagesForHousehold = async(householdId) => {
    try {
        const snapshot = await db.collection('Electricity Meter Usages').where('householdId', '==', householdId).get();
        const usages = snapshot.docs.map(doc => ({id:doc.id, ...doc.data()}));
        return usages;
    }
    catch(error) {
        console.error('Error getting electricity meter usages!', error);
        throw error;
    }
}; 

const getApplianceEnergyUsagesForHousehold = async(householdId) => {
    try {
        const snapshot = await db.collection('Appliance Energy Usages').where('householdId', '==', householdId).get();
        const usages = snapshot.docs.map(doc => ({id:doc.id, ...doc.data()}));
        return usages;
    }
    catch(error) {
        console.error('Error getting appliance energy usages!', error);
        throw error;
    }    
};

const getApplianceEnergyUsagesByUser = async(userId) => {
    try {
        const snapshot = await db.collection('Appliance Energy Usages').where('userId', '==', userId).get();
        const usages = snapshot.docs.map(doc => ({id:doc.id, ...doc.data()}));
        return usages;
    }
    catch(error) {
        console.error('Error getting electricity meter usages!', error);
        throw error;
    }
};

const addElectricityMeterUsage = async(data) => {
    try {
        const doc = await db.collection('Electricity Meter Usages').add(data);
        console.log('Added electricity meter usage with ID ', doc.id);
    }
    catch(error) {
        console.error('Error adding electricity meter usage!', error);
        throw error;
    }
};

const addApplianceEnergyUsage = async(data) => {
    try {
        const doc = await db.collection('Appliance Energy Usages').add(data);
        console.log('Added appliance energy usage with ID ', doc.id);
    }
    catch(error) {
        console.error('Error adding appliance energy usage!', error);
        throw error;
    }
};

const changeUsageLimits = async (householdId, weekly, monthly) => {
  try {
    const household = await getHouseholdById(householdId); 
    const newData = {
      ...household,
      weeklyLimit: weekly,
      monthlyLimit: monthly
    };
    await db.collection('Households').doc(householdId).set(newData);
    return newData;
  } 
  catch (error) {
    console.error('Error changing usage limits!', error);
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
}

module.exports = {
    getAllHouseholds,
    getHouseholdById,
    getAllUsers,
    getUserById,
    changeUsageLimits,
    getNotificationsForHousehold,
    getApplianceEnergyUsagesByUser,
    getApplianceEnergyUsagesForHousehold,
    getElectricityMeterUsagesForHousehold,
    joinHousehold,
    createHousehold,
    addApplianceEnergyUsage,
    addElectricityMeterUsage,
};