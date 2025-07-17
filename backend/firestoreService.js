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

const getTariffHours = (startDate, durationHours) => {
    let highHours = 0;
    let lowHours = 0;
    let current = new Date(startDate);
    const end = new Date(current.getTime() + durationHours * 60 * 60 * 1000);

    while (current < end) {
        const nextStep = new Date(current.getTime() + 60 * 60 * 1000);
        const segmentEnd = nextStep > end ? end : nextStep;
        const hour = current.getHours();
        const isLowTariff =
            (hour >= 13 && hour < 15) || (hour >= 22 || hour < 6);
        const segmentDurationHours = (segmentEnd - current) / (1000 * 60 * 60);
        if (isLowTariff) {
            lowHours += segmentDurationHours;
        } else {
            highHours += segmentDurationHours;
        }
        current = segmentEnd;
    }
    return { highHours, lowHours };
};

const calculateTotalApplianceUsage = async (usages) => {
    try {
        const appliances = await getAppliances();
        const prices = await getElectricityPrices();
        const appliancesData = {};
        appliances.forEach(appliance => {
            appliancesData[appliance.applianceName] = appliance.consumptionPerHour;
        });

        let totalKWh = 0;
        let totalCost = 0;
        let highTariffKWh = 0;
        let lowTariffKWh = 0;

        const applianceBreakdown = {};

        usages.forEach(usage => {
            const applianceName = usage.appliance;
            const duration = usage.timeDuration;
            const consumptionPerHour = appliancesData[applianceName];
            const startTime = usage.startingTime.toDate();

            const { highHours, lowHours } = getTariffHours(startTime, duration);

            const highKWh = highHours * consumptionPerHour;
            const lowKWh = lowHours * consumptionPerHour;

            const lowTariffPrice = prices.find(p => p.tariff === 'Low tariff').price;
            const highTariffPrice = prices.find(p => p.tariff === 'High Tariff 2').price;

            const highCost = highKWh * highTariffPrice;
            const lowCost = lowKWh * lowTariffPrice;

            totalKWh += highKWh + lowKWh;
            highTariffKWh += highKWh;
            lowTariffKWh += lowKWh;
            totalCost += highCost + lowCost;

            if (!applianceBreakdown[applianceName]) {
                applianceBreakdown[applianceName] = {
                    kWh: 0,
                    cost: 0
                };
            }
            applianceBreakdown[applianceName].kWh += highKWh + lowKWh;
            applianceBreakdown[applianceName].cost += highCost + lowCost;
        });
        return {
            totalKWh: totalKWh.toFixed(2),
            totalCost: totalCost.toFixed(2),
            highTariffKWh: highTariffKWh.toFixed(2),
            lowTariffKWh: lowTariffKWh.toFixed(2),
            applianceBreakdown: Object.fromEntries(
                Object.entries(applianceBreakdown).map(([name, data]) => [
                    name,
                    {
                        kWh: data.kWh.toFixed(2),
                        cost: data.cost.toFixed(2)
                    }
                ])
            )
        };
    } catch (error) {
        console.error('Error calculating appliance energy usage!', error);
        throw error;
    }
};

const calculateUsageConsumptionAndCost = async (usage) => {
    try {
        let highTariffKWh;
        let lowTariffKWh;
        const prices = await getElectricityPrices();
        const lowTariffPrice = prices.find(p => p.tariff === 'Low tariff').price;
        const highTariffPrice = prices.find(p => p.tariff === 'High Tariff 2').price;

        if(usage.appliance) { //appliance energy usage
            const appliances = await getAppliances();
            const appliancesData = {};
            appliances.forEach(appliance => {
                appliancesData[appliance.applianceName] = appliance.consumptionPerHour;
            });
            const applianceName = usage.appliance;
            const duration = usage.timeDuration;
            const consumptionPerHour = appliancesData[applianceName];
            const startTime = usage.startingTime.toDate();
            const { highHours, lowHours } = getTariffHours(startTime, duration);
            highTariffKWh = highHours * consumptionPerHour;
            lowTariffKWh = lowHours * consumptionPerHour;
        }
        else if(usage.highTariff && usage.lowTariff) { //electricity meter usage
            const monthlyReadings = await getMonthlyReadings(usage.householdId);
            const lastReadingLowTariff = parseFloat(monthlyReadings?.lastReadingLowTariff || 0);
            const lastReadingHighTariff = parseFloat(monthlyReadings?.lastReadingHighTariff || 0);
            highTariffKWh = (usage.highTariff - lastReadingHighTariff);
            lowTariffKWh = (usage.lowTariff - lastReadingLowTariff);
        }

        const highCost = highTariffKWh * highTariffPrice;
        const lowCost = lowTariffKWh * lowTariffPrice;

        const totalKWh = highTariffKWh + lowTariffKWh;
        const totalCost = highCost + lowCost;

        return {
            totalKWh: totalKWh.toFixed(2),
            totalCost: totalCost.toFixed(2),
            highTariffKWh: highTariffKWh.toFixed(2),
            lowTariffKWh: lowTariffKWh.toFixed(2),
        };
    } catch (error) {
        console.error('Error calculating appliance energy usage!', error);
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

const addElectricityMeterUsage = async(data) => {
    try {
        const totalCostAndConsumption = await calculateUsageConsumptionAndCost(data);
        const doc = await db.collection('Electricity Meter Usages').add(data);
        return totalCostAndConsumption;
    }
    catch(error) {
        console.error('Error adding electricity meter usage!', error);
        throw error;
    }
};

const addApplianceEnergyUsage = async(data) => {
    try {
        const doc = await db.collection('Appliance Energy Usages').add(data);
        const totalCostAndConsumption = await calculateUsageConsumptionAndCost(data);
        return totalCostAndConsumption;
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
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
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
    getWeeklyElectricityCostAndConsumption,
};