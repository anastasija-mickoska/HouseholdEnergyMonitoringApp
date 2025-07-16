const { db } = require('./config/firebaseConfig');
const { startOfWeek, endOfWeek } = require('date-fns');

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
        console.log('Doc date: ', data.date);
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
        console.log('Doc date: ', doc.date);
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
};

const getWeeklyApplianceUsageByUser = async(userId) => {
    try {
        const now = new Date();
        const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
        const endOfWeekDate = endOfWeek(now, { weekStartsOn: 1 });
        const weeklyUsages = await db.collection('Appliance Energy Usages').where('date', '>=', startOfWeekDate).where('date', '<=', endOfWeekDate).get();
        const weeklyusageData = weeklyUsages.docs.map(doc => ({ id: doc.id, ...doc.data()}));        
        console.log('Retrieved weekly appliance usage data:', weeklyusageData);
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
        console.log('Retrieved monthly appliance usage data:', weeklyusageData);
        return weeklyusageData;
    }
    catch(error) {
        console.error('Error calculating monthly appliance usage by user!', error);
        throw error;
    }
};

const getElectricityPrices = async() => {
    try {
        const snapshot = await db.collection('Electricity Prices').get();
        const prices = snapshot.docs.map(doc => ({ id:doc.id, ...doc.data()}));
        return prices;
    }
    catch(error) {
        console.error('Error getting electricity prices!', error);
        throw error;
    }
};

const getMonthlyReadings = async(householdId) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of this month, 00:00
        const monthlyUsages = await db.collection('Electricity Meter Usages').where('householdId', '==', householdId).where('date', '>=', startOfMonth).where('date', '<=', now).get();
        const monthlyUsagesData = monthlyUsages.docs.map(doc => ({id:doc.id, ...doc.data()})).sort((a, b) => a.date.toDate() - b.date.toDate());
        if (monthlyUsagesData.length < 2) {
            console.warn('Not enough data to calculate monthly consumption.');
            return 0;
        }
        const firstReadingLowTariff = parseFloat(monthlyUsagesData[0].lowTariff); 
        const firstReadingHighTariff = parseFloat(monthlyUsagesData[0].highTariff);
        const lastReadingLowTariff = parseFloat(monthlyUsagesData[monthlyUsagesData.length - 1].lowTariff);
        const lastReadingHighTariff = parseFloat(monthlyUsagesData[monthlyUsagesData.length - 1].highTariff);      
        
        return {firstReadingLowTariff: firstReadingLowTariff.toFixed(2), lastReadingLowTariff: lastReadingLowTariff.toFixed(2),
            firstReadingHighTariff: firstReadingHighTariff.toFixed(2), lastReadingHighTariff: lastReadingHighTariff.toFixed(2)};
    }
    catch(error) {
        console.error('Error getting monthly readings!', error);
        throw error;
    }
}

const getMonthlyElectricityCostAndConsumption = async (householdId) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyUsages = await db.collection('Electricity Meter Usages')
            .where('householdId', '==', householdId)
            .where('date', '>=', startOfMonth)
            .where('date', '<=', now)
            .get();

        const monthlyUsagesData = monthlyUsages.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => a.date.toDate() - b.date.toDate());

        const firstReadingLowTariff = parseFloat(monthlyUsagesData[0].lowTariff);
        const firstReadingHighTariff = parseFloat(monthlyUsagesData[0].highTariff);
        const lastReadingLowTariff = parseFloat(monthlyUsagesData[monthlyUsagesData.length - 1].lowTariff);
        const lastReadingHighTariff = parseFloat(monthlyUsagesData[monthlyUsagesData.length - 1].highTariff);

        const monthlyConsumptionLowTariff = lastReadingLowTariff - firstReadingLowTariff;
        let monthlyConsumptionHighTariff = lastReadingHighTariff - firstReadingHighTariff;

        const prices = await getElectricityPrices();
        const lowTariffPrice = prices.find(p => p.tariff === 'Low tariff')?.price ?? 0;

        const blocks = [
            prices.find(p => p.tariff === 'High Tariff 1'),
            prices.find(p => p.tariff === 'High Tariff 2'),
            prices.find(p => p.tariff === 'High Tariff 3'),
            prices.find(p => p.tariff === 'High Tariff 4')
        ];

        const monthlyCostLowTariff = monthlyConsumptionLowTariff * lowTariffPrice;

        let monthlyCostHighTariff = 0;
        let remainingConsumption = monthlyConsumptionHighTariff;

        for (let block of blocks) {
            const blockCapacity = block.upperLimit - block.lowerLimit;
            const consumptionInBlock = Math.min(remainingConsumption, blockCapacity);
            monthlyCostHighTariff += consumptionInBlock * block.price;
            remainingConsumption -= consumptionInBlock;

            if (remainingConsumption <= 0) break;
        }

        const totalConsumption = monthlyConsumptionLowTariff + monthlyConsumptionHighTariff;

        return {
            lowTariffConsumption: monthlyConsumptionLowTariff.toFixed(2),
            highTariffConsumption: monthlyConsumptionHighTariff.toFixed(2),
            totalCost: (monthlyCostHighTariff + monthlyCostLowTariff).toFixed(2),
            totalConsumption: totalConsumption.toFixed(2)
        };
    } catch (error) {
        console.error('Error calculating electricity cost!', error);
        throw error;
    }
};

const getWeeklyElectricityCostAndConsumption = async (householdId) => {
    try {
        const now = new Date();
        const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });
        const weeklyUsages = await db.collection('Electricity Meter Usages')
            .where('householdId', '==', householdId)
            .where('date', '>=', startOfWeekDate)
            .where('date', '<=', now)
            .get();

        const weeklyUsagesData = weeklyUsages.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => a.date.toDate() - b.date.toDate());

        const firstReadingLowTariff = parseFloat(weeklyUsagesData[0].lowTariff);
        const firstReadingHighTariff = parseFloat(weeklyUsagesData[0].highTariff);
        const lastReadingLowTariff = parseFloat(weeklyUsagesData[weeklyUsagesData.length - 1].lowTariff);
        const lastReadingHighTariff = parseFloat(weeklyUsagesData[weeklyUsagesData.length - 1].highTariff);

        const weeklyConsumptionLowTariff = lastReadingLowTariff - firstReadingLowTariff;
        const weeklyConsumptionHighTariff = lastReadingHighTariff - firstReadingHighTariff;

        const prices = await getElectricityPrices();
        const lowTariffPrice = prices.find(p => p.tariff === 'Low tariff')?.price;

        const blocks = [
            prices.find(p => p.tariff === 'High Tariff 1'),
            prices.find(p => p.tariff === 'High Tariff 2'),
            prices.find(p => p.tariff === 'High Tariff 3'),
            prices.find(p => p.tariff === 'High Tariff 4')
        ];

        const weeklyCostLowTariff = weeklyConsumptionLowTariff * lowTariffPrice;

        const monthlyReadings = await getMonthlyReadings(householdId);
        const firstReadingHighTariffMonthly = monthlyReadings.firstReadingHighTariff;
        const lastReadingHighTariffMonthly = monthlyReadings.lastReadingHighTariff;

        const monthlyHighTariffBeforeThisWeek = firstReadingHighTariffMonthly;
        const monthlyHighTariffAfterThisWeek = lastReadingHighTariffMonthly;

        let remainingWeeklyConsumption = weeklyConsumptionHighTariff;
        let currentMonthlyConsumption = monthlyHighTariffBeforeThisWeek;
        let weeklyCostHighTariff = 0;

        for (let block of blocks) {
            const blockLower = block.lowerLimit;
            const blockUpper = block.upperLimit;
            const blockCapacity = blockUpper - Math.max(currentMonthlyConsumption, blockLower);

            if (blockCapacity <= 0) continue; 

            const consumptionInBlock = Math.min(remainingWeeklyConsumption, blockCapacity);
            weeklyCostHighTariff += consumptionInBlock * block.price;

            currentMonthlyConsumption += consumptionInBlock;
            remainingWeeklyConsumption -= consumptionInBlock;

            if (remainingWeeklyConsumption <= 0) break;
        }

        return {
            lowTariffConsumption: weeklyConsumptionLowTariff.toFixed(2),
            highTariffConsumption: weeklyConsumptionHighTariff.toFixed(2),
            totalCost: (weeklyCostHighTariff + weeklyCostLowTariff).toFixed(2),
            totalConsumption: (weeklyConsumptionLowTariff + weeklyConsumptionHighTariff).toFixed(2)
        };
    } catch (error) {
        console.error('Error calculating electricity cost!', error);
        throw error;
    }
};


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
    getAppliances,
    getElectricityPrices,
    getMonthlyElectricityCostAndConsumption,
    getWeeklyApplianceUsageByUser,
    getMonthlyApplianceUsageByUser,
    getWeeklyElectricityCostAndConsumption
};