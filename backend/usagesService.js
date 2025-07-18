const { db } = require('./config/firebaseConfig');
const { startOfWeek, endOfWeek, format, subWeeks, startOfMonth, endOfMonth, subMonths, isBefore, isEqual } = require('date-fns');

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


const getReadingsForHouseholdForFiveWeeks = async (householdId) => {
    try {
        const now = new Date();
        const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
        const startOfFiveWeeksAgo = subWeeks(startOfThisWeek, 5);

        const readings = await db.collection('Electricity Meter Usages')
            .where('householdId', '==', householdId)
            .where('date', '>=', startOfFiveWeeksAgo)
            .where('date', '<=', now)
            .get();

        const readingsData = readings.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate()
        })).sort((a, b) => a.date - b.date); 

        return readingsData;
    } catch (error) {
        console.error('Error getting readings for household!', error);
        throw error;
    }
};

const getReadingsForHouseholdForFiveMonths = async(householdId) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfFiveMonthsAgo = subMonths(startOfMonth, 5);
        const readings = await db.collection('Electricity Meter Usages')
            .where('householdId', '==', householdId)
            .where('date', '>=', startOfFiveMonthsAgo)
            .where('date', '<=', now)
            .get();

        const readingsData = readings.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate()
        })).sort((a, b) => a.date - b.date);
        return readingsData;
    }
    catch(error) {
        console.error('Error getting all readings for household!',error);
        throw error;
    }
};

const calculateWeeklyConsumptionForFiveWeeks = async (householdId) => {
    const readings = await getReadingsForHouseholdForFiveWeeks(householdId);
    const numberOfWeeks = 5;
    const result = [];

    for (let i = numberOfWeeks - 1; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });

        const readingAtStart = [...readings]
            .filter(r => isBefore(r.date, weekStart) || isEqual(r.date, weekStart))
            .sort((a, b) => b.date - a.date)[0];

        const readingAtEnd = [...readings]
            .filter(r => isBefore(r.date, weekEnd) || isEqual(r.date, weekEnd))
            .sort((a, b) => b.date - a.date)[0];

        if (readingAtStart && readingAtEnd) {
            const highKWh = readingAtEnd.highTariff - readingAtStart.highTariff;
            const lowKWh = readingAtEnd.lowTariff - readingAtStart.lowTariff;
            const consumption = highKWh + lowKWh;

            result.push({
                weekLabel: `${format(weekStart, 'dd MMM')}`,
                consumption: consumption.toFixed(2)
            });
        } else {
            result.push({
                weekLabel: `${format(weekStart, 'dd MMM')}`,
                consumption: '0.00'
            });
        }
    }

    return result;
};

const calculateMonthlyConsumptionForFiveMonths = async (householdId) => {
    const readings = await getReadingsForHouseholdForFiveMonths(householdId);
    
    const monthlyConsumptions = [];

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    for (let i = 0; i < 5; i++) {
        const monthStart = subMonths(startOfCurrentMonth, i);
        const monthEnd = endOfMonth(monthStart);

        const readingsInMonth = readings.filter(r => r.date >= monthStart && r.date <= monthEnd);

        if (readingsInMonth.length >= 2) {
            const first = readingsInMonth[0];
            const last = readingsInMonth[readingsInMonth.length - 1];

            const consumptionHigh = last.highTariff - first.highTariff;
            const consumptionLow = last.lowTariff - first.lowTariff;
            const totalConsumption = consumptionHigh + consumptionLow;

            monthlyConsumptions.push({
                monthLabel: monthStart.toLocaleString('default', { month: 'short'}),
                consumption: totalConsumption.toFixed(2),
            });
        }
    }
    return monthlyConsumptions.reverse(); 
};

module.exports = {
    calculateTotalApplianceUsage,
    calculateUsageConsumptionAndCost,
    calculateWeeklyConsumptionForFiveWeeks,
    getWeeklyElectricityCostAndConsumption,
    getMonthlyElectricityCostAndConsumption,
    getAppliances,
    getElectricityPrices,
    calculateMonthlyConsumptionForFiveMonths
}