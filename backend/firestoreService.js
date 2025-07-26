const { db } = require('./config/firebaseConfig');
const { startOfWeek, endOfWeek } = require('date-fns');
const {calculateTotalApplianceUsage, calculateUsageConsumptionAndCost} = require('./usagesService');

const checkIfHouseholdExists = async (householdName, householdCode) => {
    try {
        const snapshot = await db.collection('Households').where('householdName', '==', householdName).where('householdCode', '==', householdCode).get();
        return !snapshot.empty;
    }
    catch(error) {
        console.error('Error checking if household exists!', error);
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
        const householdName = household.householdName;
        const householdCode = household.householdCode;
        const exists = checkIfHouseholdExists(householdName, householdCode);
        if(!exists) {
            throw new Error('Household already exists!');
        }
        else {
            const doc = await db.collection('Households').add(household);
            return doc.id; 
        }

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

const getUsersForHousehold = async(householdId) => {
    try {
        const snapshot = await db.collection('users').where('householdId', '==', householdId).get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users;
    }
    catch(error) {
        console.error('Erro getting users for household!', error);
        throw error;
    }
}

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

const getApplianceEnergyUsagesForHousehold = async(householdId, type) => {
    try {
        let usages;
        if(type == 'weekly') {
            const now = new Date();
            const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
            const endOfWeekDate = endOfWeek(now, { weekStartsOn: 1 });
            const weeklyUsages = await db.collection('Appliance Energy Usages').where('householdId', '==', householdId).where('date', '>=', startOfWeekDate).where('date', '<=', endOfWeekDate).get();
            usages = weeklyUsages.docs.map(doc => ({id:doc.id, ...doc.data()}));
        }
        else if(type == 'monthly') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
            const monthlyUsages = await db.collection('Appliance Energy Usages').where('householdId', '==', householdId).where('date', '>=', startOfMonth).where('date', '<=', now).get();
            usages = monthlyUsages.docs.map(doc => ({ id: doc.id, ...doc.data()}));      
        }
        const data = await calculateTotalApplianceUsage(usages);
        return data;
    }
    catch(error) {
        console.error('Error getting appliance energy usages!', error);
        throw error;
    }    
};

const getApplianceEnergyUsagesByUser = async(userId, type) => {
    try {
        let usages;
        if(type == 'weekly') {
            const now = new Date();
            const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
            const endOfWeekDate = endOfWeek(now, { weekStartsOn: 1 });
            const weeklyUsages = await db.collection('Appliance Energy Usages').where('userId', '==', userId).where('date', '>=', startOfWeekDate).where('date', '<=', endOfWeekDate).get();
            usages = weeklyUsages.docs.map(doc => ({id:doc.id, ...doc.data()}));
        }
        else if(type == 'monthly') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
            const monthlyUsages = await db.collection('Appliance Energy Usages').where('userId', '==', userId).where('date', '>=', startOfMonth).where('date', '<=', now).get();
            usages = monthlyUsages.docs.map(doc => ({ id: doc.id, ...doc.data()}));      
        }
        const data = await calculateTotalApplianceUsage(usages);
        return data;
    }
    catch(error) {
        console.error('Error getting electricity meter usages!', error);
        throw error;
    }
};

const checkIfElectricityMeterUsageEntryExists = async(data) => {
    try {
        const snapshot = await db.collection('Electricity Meter Usages').where('lowTariff', '==', data.lowTariff)
        .where('highTariff', '==', data.highTariff)
        .where('date', '==', data.date)
        .where('householdId', '==', data.householdId)
        .get();
        return !snapshot.empty;    
    }
    catch(error) {
        console.error('Error checking if electricity meter usage exists!', error);
        throw error;
    }
};

const addElectricityMeterUsage = async(data) => {
    try {
        const lowTariff = data.lowTariff;
        const highTariff = data.highTariff;
        const date = data.date;
        const householdId = data.householdId
        const newData = {
            lowTariff,
            highTariff,
            date,
            householdId
        };
        const exists = await checkIfElectricityMeterUsageEntryExists(newData);
        if(exists) {
            throw new Error('This electricity meter data already exists!');
        }
        else {
            const totalCostAndConsumption = await calculateUsageConsumptionAndCost(data);
            const doc = await db.collection('Electricity Meter Usages').add(data);
            return totalCostAndConsumption;
        }
    }
    catch(error) {
        console.error('Error adding electricity meter usage!', error);
        throw error;
    }
};

const checkIfApplianceUsageEntryExists = async(data) => {
    try {
        const snapshot = await db.collection('Appliance Energy Usages')
        .where('appliance', '==', data.appliance)
        .where('timeDuration', '==', data.timeDuration)
        .where('date', '==', data.date)
        .where('startingTime','==', data.startingTime)
        .where('householdId', '==', data.householdId)
        .get();
        return !snapshot.empty;    
    }
    catch(error) {
        console.error('Error checking if appliance usage exists!', error);
        throw error;
    }
};

const addApplianceEnergyUsage = async(data) => {
    try {
        const appliance = data.appliance;
        const timeDuration = data.timeDuration;
        const date = data.date;
        const startingTime = data.startingTime;
        const householdId = data.householdId
        const newData = {
            appliance,
            timeDuration,
            date,
            startingTime,
            householdId
        };
        const exists = await checkIfApplianceUsageEntryExists(newData);
        if(exists) {
            throw new Error('This appliance energy usage already exists!');
        }
        else {
            const doc = await db.collection('Appliance Energy Usages').add(data);
            const totalCostAndConsumption = await calculateUsageConsumptionAndCost(data);
            return totalCostAndConsumption;
        }
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

const getWeeklyApplianceUsageByUser = async(userId) => {
    try {
        const now = new Date();
        const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
        const endOfWeekDate = endOfWeek(now, { weekStartsOn: 1 });
        const weeklyUsages = await db.collection('Appliance Energy Usages').where('userId', '==', userId).where('date', '>=', startOfWeekDate).where('date', '<=', endOfWeekDate).get();
        const weeklyusageData = weeklyUsages.docs.map(doc => ({ id: doc.id, ...doc.data()}));        
        return weeklyusageData;
    }
    catch(error) {
        console.error('Error calculating weekly appliance usage by user!', error);
        throw error;
    }
};

const getMonthlyApplianceUsageByUser = async(userId) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
        const weeklyUsages = await db.collection('Appliance Energy Usages').where('userId', '==', userId).where('date', '>=', startOfMonth).where('date', '<=', now).get();
        const weeklyusageData = weeklyUsages.docs.map(doc => ({ id: doc.id, ...doc.data()}));        
        return weeklyusageData;
    }
    catch(error) {
        console.error('Error calculating monthly appliance usage by user!', error);
        throw error;
    }
};

const checkIfTodayEntryExists = async(householdId) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const snapshot = await db
        .collection('Electricity Meter Usages')
        .where('householdId', '==', householdId)
        .where('date', '>=', Timestamp.fromDate(startOfDay))
        .where('date', '<=', Timestamp.fromDate(endOfDay))
        .get();

        return !snapshot.empty;
    }
    catch(error) {
        console.error('Error checking entries!', error);
        throw error;
    }
}

module.exports = {
    checkIfHouseholdExists,
    getHouseholdById,
    getHouseholdByName,
    getUserById,
    getUsersForHousehold,
    changeUsageLimits,
    getApplianceEnergyUsagesByUser,
    getApplianceEnergyUsagesForHousehold,
    getElectricityMeterUsagesForHousehold,
    joinHousehold,
    createHousehold,
    addApplianceEnergyUsage,
    addElectricityMeterUsage,
    setUserHousehold,
    getWeeklyApplianceUsageByUser,
    getMonthlyApplianceUsageByUser,
    checkIfTodayEntryExists
};