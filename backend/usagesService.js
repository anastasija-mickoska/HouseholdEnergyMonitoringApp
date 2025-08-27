const { db } = require('./config/firebaseConfig');
const { startOfWeek, endOfWeek, format, subWeeks, startOfMonth, endOfMonth, subMonths, isBefore, isEqual, startOfDay, endOfDay, subDays } = require('date-fns');

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

const getLastElectricityMeterReading = async(householdId) => {
    try {
        const snapshot = await db.collection('Electricity Meter Usages').where('householdId', '==', householdId).orderBy('date','desc').limit(1).get();
        if(snapshot.empty) {
            return {highTariff: '0.00', lowTariff: '0.00'};
        }
        const reading = snapshot.docs[0];
        const readingData = reading.data();
        const highTariff = parseFloat(readingData.highTariff ?? 0);
        const lowTariff = parseFloat(readingData.lowTariff ?? 0);
        return {id: reading.id, highTariff: highTariff.toFixed(2), lowTariff: lowTariff.toFixed(2)};
    }
    catch(error) {
        console.error('Error getting the latest reading!', error);
        throw error;
    }
}

const getMonthlyReadings = async(householdId) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyUsages = await db.collection('Electricity Meter Usages').where('householdId', '==', householdId).where('date', '>=', startOfMonth).where('date', '<=', now).get();
        const monthlyUsagesData = monthlyUsages.docs.map(doc => ({id:doc.id, ...doc.data()})).sort((a, b) => a.date.toDate() - b.date.toDate());
        if (monthlyUsagesData.length < 2) {
            console.warn('Not enough data to calculate monthly consumption.');
            return {
                firstReadingLowTariff: '0.00',
                lastReadingLowTariff: '0.00',
                firstReadingHighTariff: '0.00',
                lastReadingHighTariff: '0.00',
                month: startOfMonth
            };
        }
        const firstReadingLowTariff = parseFloat(monthlyUsagesData[0].lowTariff); 
        const firstReadingHighTariff = parseFloat(monthlyUsagesData[0].highTariff);
        const lastReadingLowTariff = parseFloat(monthlyUsagesData[monthlyUsagesData.length - 1].lowTariff);
        const lastReadingHighTariff = parseFloat(monthlyUsagesData[monthlyUsagesData.length - 1].highTariff);      
        
        return {firstReadingLowTariff: firstReadingLowTariff.toFixed(2), lastReadingLowTariff: lastReadingLowTariff.toFixed(2),
            firstReadingHighTariff: firstReadingHighTariff.toFixed(2), lastReadingHighTariff: lastReadingHighTariff.toFixed(2),
            month: startOfMonth};
    }
    catch(error) {
        console.error('Error getting monthly readings!', error);
        throw error;
    }
}

const getMonthlyElectricityCostAndConsumption = async (householdId) => {
    try {
        const monthly = await getMonthlyReadings(householdId);
        const firstReadingLowTariff = parseFloat(monthly.firstReadingLowTariff ?? 0);
        const firstReadingHighTariff = parseFloat(monthly.firstReadingHighTariff ?? 0);
        const lastReadingLowTariff = parseFloat(monthly.lastReadingLowTariff ?? 0);
        const lastReadingHighTariff = parseFloat(monthly.lastReadingHighTariff ?? 0);

        const monthlyConsumptionLowTariff = lastReadingLowTariff - firstReadingLowTariff;
        const monthlyConsumptionHighTariff = lastReadingHighTariff - firstReadingHighTariff;

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
            totalConsumption: totalConsumption.toFixed(2),
            monthStart: monthly.month
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
        const endOfWeekDate = endOfWeek(now, {weekStartsOn:1});
        const weeklyUsages = await db.collection('Electricity Meter Usages')
            .where('householdId', '==', householdId)
            .where('date', '>=', startOfWeekDate)
            .where('date', '<=', now)
            .get();
        const weeklyUsagesData = weeklyUsages.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).sort((a, b) => a.date.toDate() - b.date.toDate());
        if (weeklyUsagesData.length < 2) {
            return {
                lowTariffConsumption: '0.00',
                highTariffConsumption: '0.00',
                totalCost: '0.00',
                totalConsumption: '0.00',
                startOfWeek: startOfWeekDate,
                endOfWeek: endOfWeekDate
            };
        }

        const firstReadingLowTariff = parseFloat(weeklyUsagesData[0].lowTariff ?? 0);
        const firstReadingHighTariff = parseFloat(weeklyUsagesData[0].highTariff ?? 0);
        const lastReadingLowTariff = parseFloat(weeklyUsagesData[weeklyUsagesData.length - 1].lowTariff ?? 0);
        const lastReadingHighTariff = parseFloat(weeklyUsagesData[weeklyUsagesData.length - 1].highTariff ?? 0);

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

        let remainingWeeklyConsumption = weeklyConsumptionHighTariff;
        let currentMonthlyConsumption = lastReadingHighTariffMonthly - firstReadingHighTariffMonthly; 
        let startOfWeekConsumption = currentMonthlyConsumption - remainingWeeklyConsumption;
        let weeklyCostHighTariff = 0;

        for (let block of blocks) {
            const blockLower = block.lowerLimit;
            const blockUpper = block.upperLimit;
            const blockCapacity = blockUpper - Math.max(startOfWeekConsumption, blockLower);

            if (blockCapacity <= 0) continue; 

            const consumptionInBlock = Math.min(remainingWeeklyConsumption, blockCapacity);
            weeklyCostHighTariff += consumptionInBlock * block.price;

            startOfWeekConsumption += consumptionInBlock;
            remainingWeeklyConsumption -= consumptionInBlock;

            if (remainingWeeklyConsumption <= 0) break;
        }

        return {
            lowTariffConsumption: weeklyConsumptionLowTariff.toFixed(2),
            highTariffConsumption: weeklyConsumptionHighTariff.toFixed(2),
            totalCost: (weeklyCostHighTariff + weeklyCostLowTariff).toFixed(2),
            totalConsumption: (weeklyConsumptionLowTariff + weeklyConsumptionHighTariff).toFixed(2),
            startOfWeek: startOfWeekDate,
            endOfWeek: endOfWeekDate
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
        else if (usage.highTariff !== undefined && usage.lowTariff !== undefined) { //electricity meter usage
            const lastReading = await getLastElectricityMeterReading(usage.householdId);
            const lastReadingLowTariff = parseFloat(lastReading.lowTariff ?? 0);
            const lastReadingHighTariff = parseFloat(lastReading.highTariff ?? 0);

            if (lastReadingHighTariff === 0 && lastReadingLowTariff === 0) {
                highTariffKWh = 0;
                lowTariffKWh = 0;
            } else {
                highTariffKWh = parseFloat(usage.highTariff) - lastReadingHighTariff;
                lowTariffKWh = parseFloat(usage.lowTariff) - lastReadingLowTariff;
            }
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

const getReadingsForHouseholdForFiveDays = async(householdId) => {
    try {
        const now = new Date();
        const startOfToday = startOfDay(now);
        const startOfFiveDaysAgo = subDays(startOfToday, 6);

        const readings = await db.collection('Electricity Meter Usages')
            .where('householdId', '==', householdId)
            .where('date', '>=', startOfFiveDaysAgo)
            .where('date', '<=', startOfToday)
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
    const numberOfWeeks = 5;
    const monthlyConsumptions = [];
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);

    for (let i = numberOfWeeks-1; i >= 0; i--) {
        const monthStart = subMonths(startOfCurrentMonth, i);
        const monthEnd = endOfMonth(monthStart);

        const readingsInMonth = readings.filter(r => r.date >= monthStart && r.date <= monthEnd);

        if (readingsInMonth.length >= 2) {
            const sortedReadings = readingsInMonth.sort((a, b) => a.date - b.date);
            const first = sortedReadings[0];
            const last = sortedReadings[sortedReadings.length - 1];

            const consumptionHigh = last.highTariff - first.highTariff;
            const consumptionLow = last.lowTariff - first.lowTariff;
            const totalConsumption = consumptionHigh + consumptionLow;

            monthlyConsumptions.push({
                monthLabel: monthStart.toLocaleString('default', { month: 'short' }),
                consumption: totalConsumption.toFixed(2),
            });
        } else {
            monthlyConsumptions.push({
                monthLabel: monthStart.toLocaleString('default', { month: 'short' }),
                consumption: '0.00',
            });
        }
    }

    return monthlyConsumptions;
};

const getDailyElectricityCostAndConsumption = async (householdId) => {
  try {
    const now = new Date();
    const startOfDayDate = startOfDay(now);
    const endOfDayDate = endOfDay(now);
    const startOfYesterday = startOfDay(subDays(now, 1));
    const endOfYesterday = endOfDay(subDays(now, 1));

    const todayUsagesSnapshot = await db.collection('Electricity Meter Usages')
      .where('householdId', '==', householdId)
      .where('date', '>=', startOfDayDate)
      .where('date', '<=', endOfDayDate)
      .get();

    const todayUsages = todayUsagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (todayUsages.length === 0) {
      return {
        lowTariffConsumption: '0.00',
        highTariffConsumption: '0.00',
        totalCost: '0.00',
        totalConsumption: '0.00',
        day: now.getDay(),
      };
    }

    let dailyConsumptionLowTariff = 0;
    let dailyConsumptionHighTariff = 0;

    if (todayUsages.length >= 2) {
      const lowTariffValues = todayUsages.map(u => parseFloat(u.lowTariff ?? 0));
      const highTariffValues = todayUsages.map(u => parseFloat(u.highTariff ?? 0));
      dailyConsumptionLowTariff = Math.abs(Math.max(...lowTariffValues) - Math.min(...lowTariffValues));
      dailyConsumptionHighTariff = Math.abs(Math.max(...highTariffValues) - Math.min(...highTariffValues));
    } else {
      const yesterdayUsagesSnapshot = await db.collection('Electricity Meter Usages')
        .where('householdId', '==', householdId)
        .where('date', '>=', startOfYesterday)
        .where('date', '<=', endOfYesterday)
        .get();
      const yesterdayUsages = yesterdayUsagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (yesterdayUsages.length === 0) {
        dailyConsumptionLowTariff = 0;
        dailyConsumptionHighTariff = 0;
      } else {
        const yesterdayLowTariffValues = yesterdayUsages.map(u => parseFloat(u.lowTariff ?? 0));
        const yesterdayHighTariffValues = yesterdayUsages.map(u => parseFloat(u.highTariff ?? 0));
        const yesterdayConsumptionLowTariff = Math.max(...yesterdayLowTariffValues);
        const yesterdayConsumptionHighTariff = Math.max(...yesterdayHighTariffValues);
        const todayReading = todayUsages[0];

        dailyConsumptionLowTariff = Math.abs((parseFloat(todayReading.lowTariff ?? 0)) - (parseFloat(yesterdayConsumptionLowTariff ?? 0)));
        dailyConsumptionHighTariff = Math.abs((parseFloat(todayReading.highTariff ?? 0)) - (parseFloat(yesterdayConsumptionHighTariff ?? 0)));
      }
    }
    const prices = await getElectricityPrices();
    const lowTariffPrice = prices.find(p => p.tariff === 'Low tariff')?.price;

    const blocks = [
      prices.find(p => p.tariff === 'High Tariff 1'),
      prices.find(p => p.tariff === 'High Tariff 2'),
      prices.find(p => p.tariff === 'High Tariff 3'),
      prices.find(p => p.tariff === 'High Tariff 4')
    ];
    const dailyCostLowTariff = dailyConsumptionLowTariff * lowTariffPrice;
    const monthlyReadings = await getMonthlyReadings(householdId);
    const firstReadingHighTariffMonthly = monthlyReadings.firstReadingHighTariff;
    const lastReadingHighTariffMonthly = monthlyReadings.lastReadingHighTariff;

    let remainingDailyConsumption = dailyConsumptionHighTariff;
    let currentMonthlyConsumption = lastReadingHighTariffMonthly - firstReadingHighTariffMonthly;
    let startOfDayConsumption = currentMonthlyConsumption - remainingDailyConsumption;
    let dailyCostHighTariff = 0;

    for (let block of blocks) {
      if (!block) continue;

      const blockLower = block.lowerLimit;
      const blockUpper = block.upperLimit;
      const blockCapacity = blockUpper - Math.max(startOfDayConsumption, blockLower);

      if (blockCapacity <= 0) continue;

      const consumptionInBlock = Math.min(remainingDailyConsumption, blockCapacity);
      dailyCostHighTariff += consumptionInBlock * block.price;

      startOfDayConsumption += consumptionInBlock;
      remainingDailyConsumption -= consumptionInBlock;

      if (remainingDailyConsumption <= 0) break;
    }

    return {
      lowTariffConsumption: dailyConsumptionLowTariff.toFixed(2),
      highTariffConsumption: dailyConsumptionHighTariff.toFixed(2),
      totalCost: (dailyCostHighTariff + dailyCostLowTariff).toFixed(2),
      totalConsumption: (dailyConsumptionLowTariff + dailyConsumptionHighTariff).toFixed(2),
      day: now.getDay()
    };

  } catch (error) {
    console.error('Error calculating daily electricity cost!', error);
    throw error;
  }
};

const calculateDailyConsumptionForFiveDays = async (householdId) => {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const startOfSixDaysAgo = subDays(startOfToday, 6); 

    const readings = await db.collection('Electricity Meter Usages')
        .where('householdId', '==', householdId)
        .where('date', '>=', startOfSixDaysAgo)
        .where('date', '<=', endOfDay(now))
        .get();

    const allReadings = readings.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
    }));

  const result = [];

  for (let i = 4; i >= 0; i--) { // last 5 days
    const dayStart = startOfDay(subDays(new Date(), i));
    const dayEnd = endOfDay(subDays(new Date(), i));
    const yesterdayStart = startOfDay(subDays(new Date(), i + 1));
    const yesterdayEnd = endOfDay(subDays(new Date(), i + 1));

    const todayReadings = allReadings
      .filter(r => r.date >= dayStart && r.date <= dayEnd);

    let dailyLow = 0;
    let dailyHigh = 0;

    if (todayReadings.length > 1) {
      const lowTariffValues = todayReadings.map(r => parseFloat(r.lowTariff ?? 0));
      const highTariffValues = todayReadings.map(r => parseFloat(r.highTariff ?? 0));
      dailyLow = Math.abs(Math.max(...lowTariffValues) - Math.min(...lowTariffValues));
      dailyHigh = Math.abs(Math.max(...highTariffValues) - Math.min(...highTariffValues));
    } else if (todayReadings.length === 1) {
      const todayReading = todayReadings[0];

      const yesterdayReadings = allReadings
        .filter(r => r.date >= yesterdayStart && r.date <= yesterdayEnd);

      let yesterdayLow = 0;
      let yesterdayHigh = 0;

      if (yesterdayReadings.length > 0) {
        yesterdayLow = Math.max(...yesterdayReadings.map(r => parseFloat(r.lowTariff ?? 0)));
        yesterdayHigh = Math.max(...yesterdayReadings.map(r => parseFloat(r.highTariff ?? 0)));        
        dailyLow = Math.abs(parseFloat(todayReading.lowTariff ?? 0) - yesterdayLow);
        dailyHigh = Math.abs(parseFloat(todayReading.highTariff ?? 0) - yesterdayHigh);
      }
      else if(yesterdayReadings.length == 0) {
        dailyLow = 0;
        dailyHigh = 0;
      }
    }

    result.push({
      dayLabel: format(dayStart, 'dd MMM'),
      consumption: (dailyLow + dailyHigh).toFixed(2)
    });
  }
  console.log('Five days result:',result);
  return result;
};

module.exports = {
    calculateTotalApplianceUsage,
    calculateUsageConsumptionAndCost,
    calculateWeeklyConsumptionForFiveWeeks,
    getWeeklyElectricityCostAndConsumption,
    getMonthlyElectricityCostAndConsumption,
    getAppliances,
    getElectricityPrices,
    calculateMonthlyConsumptionForFiveMonths,
    getDailyElectricityCostAndConsumption,
    calculateDailyConsumptionForFiveDays
}