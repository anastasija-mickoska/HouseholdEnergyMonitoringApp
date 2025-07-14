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

const getHouseholdByName = async(name) => {
    try {
        const household = await db.collection('Households').where('householdName', '==', name).get();
        if (household.empty) {
            throw new Error('Household with this name does not exist!');
        }
        const householdId = household.docs[0].id;
        return householdId;
    }
    catch(error) {
        console.error('Error finding household by name!', error);
        throw error;
    }
};

const createHousehold = async(household) => {
    try {
        const doc = await db.collection('Households').add(household);
        console.log('Created document with ID ', doc.id);
        return doc.id; 
    }
    catch(error) {
        console.error('Error creating household!', error);
        throw error;
    }
};

const joinHousehold = async(householdId, userId, householdCode, householdName) => {
    try {
        const doc = await db.collection('Households').doc(householdId).get();
        if(!doc.exists) {
            throw new Error('Household with this ID does not exist!');
        }
        const data = doc.data();
        const code = data.householdCode;
        const name = data.householdName;
        if(name != householdName || code != householdCode) {
            throw new Error('Invalid household data!');
        }
        const updatedMembers = data.members?.includes(userId)
        ? data.members
        : [...(data.members || []), userId];

        await db.collection('Households').doc(householdId).update({members: updatedMembers});
        await db.collection('users').doc(userId).update({householdId: householdId});
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
        if(!user.exists) {
            throw new Error('User with this ID does not exist!');
        }
        return {id:user.id, ...user.data()};
    }
    catch(error) {
        console.error('Error getting user by ID!', error);
        throw error;
    }

};

const setUserHousehold = async(id, householdId) => {
    try {
        const doc = await db.collection('users').doc(id).get();
        if(!doc.exists) {
            throw new Error('User with this ID does not exist!');
        }
        await db.collection('users').doc(id).update({householdId: householdId});
    }
    catch(error) {
        console.error('Error setting household!', error);
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
        const limitsToUpdate = {};
        if (weekly !== undefined) limitsToUpdate.weeklyLimit = weekly;
        if (monthly !== undefined) limitsToUpdate.monthlyLimit = monthly;
        if (Object.keys(limitsToUpdate).length === 0) {
            throw new Error('No valid limits provided for update.');
        }
        await db.collection('Households').doc(householdId).update(limitsToUpdate);
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
};

const getAppliances = async() => {
    try {
        const appliancesSnapshot = await db.collection('Appliance Consumption').get();
        const appliances = appliancesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return appliances;
    }
    catch(error) {
        console.error('Error getting appliances!', error);
        throw error;
    }
}

module.exports = {
    getAllHouseholds,
    getHouseholdById,
    getHouseholdByName,
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
    setUserHousehold,
    getAppliances 
};