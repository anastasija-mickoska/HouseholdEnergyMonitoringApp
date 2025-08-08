const express = require('express');
const router = express.Router();
const { 
    createHousehold, 
    getHouseholdById, 
    getHouseholdByName,
    joinHousehold, 
    deleteHousehold,
    getUserById,
    getUsersForHousehold,
    getElectricityMeterUsagesForHousehold, 
    getApplianceEnergyUsagesByUser, 
    getApplianceEnergyUsagesForHousehold, 
    addApplianceEnergyUsage, 
    addElectricityMeterUsage, 
    changeUsageLimits, 
    setUserHousehold,
    getWeeklyApplianceUsageByUser,
    getMonthlyApplianceUsageByUser,
 } = require('./firestoreService');
 const {
    calculateWeeklyConsumptionForFiveWeeks,
    calculateMonthlyConsumptionForFiveMonths,
    getWeeklyElectricityCostAndConsumption,
    getMonthlyElectricityCostAndConsumption,
    getAppliances,
} = require('./usagesService');
const {sendPushNotification, 
  addNotification, 
  getNotificationsForHousehold, 
  setUserFcmToken,
  checkEntriesAndNotify
  } = require('./notificationsService');
const authenticate = require('./config/auth');
const { Timestamp } = require('firebase-admin/firestore');
const {format} = require('date-fns');

router.post('/households', authenticate, async(req,res)=> {
  try {
    const data = req.body;
    const householdId = await createHousehold(data);
    res.status(201).json({message:'Household created.', householdId: householdId});
  }
  catch(error){
    res.status(500).json({error:error.message});
  }    
}); 

router.get('/households/:householdId', authenticate, async(req,res)=> {
  try {
    const householdId = req.params.householdId;
    const household = await getHouseholdById(householdId);
    res.status(200).json(household);
  }
  catch(error){
      console.error('Error in GET /households/:id', error);
      res.status(500).json({ error: error.message });
  }
});

router.patch('/households/:householdName', authenticate, async(req, res)=> {
  try{
    const householdName = req.params.householdName;
    const {userId, householdCode} = req.body;
    const householdId = await getHouseholdByName(householdName);
    await joinHousehold(householdId, userId, householdCode, householdName);
    res.status(200).json({message:'User added to household.', householdId: householdId});
  }
  catch(error) {
    console.error(error);
    res.status(500).json({error:error.message});
  }
}); 

router.get('/users/:id', authenticate, async(req, res)=> {
  try{
    const id = req.params.id;
    const user = await getUserById(id);
    res.json(user);
  }
  catch(error) {
    res.status(500).json({error:error.message});
  }
}); 

router.patch('/users/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    const { householdId, token } = req.body;
    if (householdId !== undefined) {
      await setUserHousehold(id, householdId);
      return res.status(200).json({ message: 'Household attached to user.' });
    }
    if (token !== undefined) {
      await setUserFcmToken(id, token);
      return res.status(200).json({ message: 'FCM token updated for user.' });
    }
    res.status(400).json({ error: 'No valid field provided. Provide either householdId or token.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/electricityMeterUsages/:householdId', authenticate, async(req,res)=> {
  try{
    const householdId = req.params.householdId;
    const results = await getElectricityMeterUsagesForHousehold(householdId);
    res.json(results);
  }
  catch(error) {
    res.status(500).json({error:error.message});
  }  
});

router.get('/applianceEnergyUsages', authenticate, async (req, res) => {
  try {
    const type = req.query.type; //weekly or monthly
    if (req.query.householdId) {
      const results = await getApplianceEnergyUsagesForHousehold(req.query.householdId, type);
      res.json(results);
    } else if (req.query.userId) {
      const results = await getApplianceEnergyUsagesByUser(req.query.userId, type);
      res.json(results);
    } else {
      return res.status(400).json({ error: 'Missing householdId or userId in query.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/electricityMeterUsages', authenticate, async(req,res)=> {
  try {
    const { userId, householdId, highTariff, lowTariff, date } = req.body;
    const usageData = {
    userId,
    householdId,
    highTariff,
    lowTariff,
    date: Timestamp.fromDate(new Date(date)) 
    };
    const returnData = await addElectricityMeterUsage(usageData);

    const household = await getHouseholdById(householdId);
    const weeklyLimit = Number(household.weeklyLimit);
    const monthlyLimit = Number(household.monthlyLimit);
    const weeklyUsageData = await getWeeklyElectricityCostAndConsumption(householdId);
    const weeklyUsage = Number(weeklyUsageData.totalConsumption);
    const monthlyUsageData = await getMonthlyElectricityCostAndConsumption(householdId);
    const monthlyUsage = Number(monthlyUsageData.totalConsumption);

    const users = await getUsersForHousehold(householdId);
    const tokens = users.map(user => user.fcmToken).filter(Boolean);

    const startWeek = format(weeklyUsageData.startOfWeek, 'MMMM dd');
    const endWeek = format(weeklyUsageData.endOfWeek, 'MMMM dd');
    const month = format(monthlyUsageData.monthStart, 'MMMM yyyy');

    const notificationsToSend = [];

    const sentNotifications = await getNotificationsForHousehold(householdId);
    const sentNotificationsText = sentNotifications.map((item)=> {
      return item.notification;
    });

    if (weeklyUsage >= 0.8 * Number(weeklyLimit) && weeklyUsage < Number(weeklyLimit)) {
        notificationsToSend.push(`80% of the weekly household limit for period ${startWeek} - ${endWeek} reached!`);
    }
    if (weeklyUsage >= Number(weeklyLimit)) {
        notificationsToSend.push(`Weekly household limit for period ${startWeek} - ${endWeek} reached!`);
    }
    if (monthlyUsage >= 0.8 * Number(monthlyLimit) && monthlyUsage < Number(monthlyLimit)) {
        notificationsToSend.push(`80% of the monthly household limit for ${month} reached!`);
    }
    if (monthlyUsage >= Number(monthlyLimit)) {
        notificationsToSend.push(`Monthly household limit for ${month} reached!`);
    }
    for (const message of notificationsToSend) {
      if(sentNotificationsText.includes(message)) {
        continue;
      }
      const validTokens = [];

      for (const token of tokens) {
        const result = await sendPushNotification(token, 'Warning', message, {
          sentAt: new Date().toISOString()
        });
        if (result === true) {
          validTokens.push(token);
        }
      }
      if (validTokens.length > 0) {
        await addNotification(householdId, validTokens, 'Warning', message);
      }
    }
    res.status(201).json({message:'Electricity meter usage added.', totalKWh: returnData.totalKWh, totalCost: returnData.totalCost});
  }
  catch(error){
    res.status(500).json({error:error.message});
  }    
});

router.post('/applianceEnergyUsages', authenticate, async(req,res)=> {
  try {
    const {userId, householdId, appliance, timeDuration, date, startingTime} = req.body;
    const usageData = {
      userId,
      householdId,
      appliance,
      timeDuration,
      startingTime: Timestamp.fromDate(new Date(startingTime)),
      date: Timestamp.fromDate(new Date(date))
    };
    const returnData = await addApplianceEnergyUsage(usageData);
    res.status(201).json({message:'Appliance energy usage added.', totalKWh: returnData.totalKWh, totalCost: returnData.totalCost});
  }
  catch(error){
    res.status(500).json({error:error.message});
  }    
});

router.patch('/households/:householdId/limits', authenticate, async(req, res) => {
  try {
    const {weeklyLimit, monthlyLimit} = req.body;
    const householdId = req.params.householdId;
    await changeUsageLimits(householdId, weeklyLimit, monthlyLimit);

    const weeklyUsageData = await getWeeklyElectricityCostAndConsumption(householdId);
    const weeklyUsage = Number(weeklyUsageData.totalConsumption);
    const monthlyUsageData = await getMonthlyElectricityCostAndConsumption(householdId);
    const monthlyUsage = Number(monthlyUsageData.totalConsumption);

    const users = await getUsersForHousehold(householdId);
    const tokens = users.map(user => user.fcmToken).filter(Boolean);

    const startWeek = format(weeklyUsageData.startOfWeek, 'MMMM dd');
    const endWeek = format(weeklyUsageData.endOfWeek, 'MMMM dd');
    const month = format(monthlyUsageData.monthStart, 'MMMM yyyy');

    const notificationsToSend = [];

    const sentNotifications = await getNotificationsForHousehold(householdId);
    const sentNotificationsText = sentNotifications.map((item)=> {
      return item.notification;
    });

    if (weeklyUsage >= 0.8 * Number(weeklyLimit) && weeklyUsage < Number(weeklyLimit)) {
        notificationsToSend.push(`80% of the weekly household limit for period ${startWeek} - ${endWeek} reached!`);
    }
    if (weeklyUsage >= Number(weeklyLimit)) {
        notificationsToSend.push(`Weekly household limit for period ${startWeek} - ${endWeek} reached!`);
    }
    if (monthlyUsage >= 0.8 * Number(monthlyLimit) && monthlyUsage < Number(monthlyLimit)) {
        notificationsToSend.push(`80% of the monthly household limit for ${month} reached!`);
    }
    if (monthlyUsage >= Number(monthlyLimit)) {
        notificationsToSend.push(`Monthly household limit for ${month} reached!`);
    }

    for (const message of notificationsToSend) {
      if(sentNotificationsText.includes(message)) {
        continue;
      }
      const validTokens = [];

      for (const token of tokens) {
        const result = await sendPushNotification(token, 'Warning', message, {
          sentAt: new Date().toISOString()
        });
        if (result === true) {
          validTokens.push(token);
        }
      }
      if (validTokens.length > 0) {
        await addNotification(householdId, validTokens, 'Warning', message);
      }
    }
    res.status(200).json({message: 'Limits saved.'});
  }
  catch(error){
    res.status(500).json({error:error.message});
  }    
});

router.get('/notifications/:householdId', authenticate, async(req,res) => {
  try {
    const householdId = req.params.householdId;
    const notifications = await getNotificationsForHousehold(householdId);
    res.json(notifications);
  }
  catch(error){
    res.status(500).json({error:error.message});
  }  
});

router.get('/appliances', authenticate, async (req, res) => {
    try {
        const appliances = await getAppliances();
        res.status(200).json(appliances);
    } catch (error) {
        console.error('Error fetching appliances:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/weeklyElectricityUsage/:householdId', authenticate, async(req,res) => {
    try {
        const householdId = req.params.householdId;
        const data = await getWeeklyElectricityCostAndConsumption(householdId);
        res.json(data);
    }
    catch (error) {
        console.error('Error getting weekly electricity usage:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/monthlyElectricityUsage/:householdId', authenticate, async(req,res) => {
    try {
        const householdId = req.params.householdId;
        const data = await getMonthlyElectricityCostAndConsumption(householdId);
        res.json(data);
    }
    catch (error) {
        console.error('Error getting monthly electricity usage:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/weeklyApplianceUsage/:userId', authenticate, async(req,res) => {
    try {
        const userId = req.params.userId;
        const data = await getWeeklyApplianceUsageByUser(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error getting weekly appliance usage for user :', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/monthlyApplianceUsage/:userId', authenticate, async(req,res) => {
    try {
        const userId = req.params.userId;
        const data = await getMonthlyApplianceUsageByUser(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error getting monthly appliance usage for user :', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/previousWeeksUsages/:householdId', authenticate, async(req,res) => {
    try {
      const householdId = req.params.householdId;
      const data = await calculateWeeklyConsumptionForFiveWeeks(householdId);
      res.json(data);
    }
    catch (error) {
        console.error('Error getting previous weeks usages for household :', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/previousMonthsUsages/:householdId', authenticate, async(req,res) => {
    try {
      const householdId = req.params.householdId;
      const data = await calculateMonthlyConsumptionForFiveMonths(householdId);
      res.json(data);
    }
    catch (error) {
        console.error('Error getting previous weeks usages for household :', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/notifications/:householdId', authenticate, async(req,res) => {
    try {
        const householdId = req.params.householdId;
        const users = await getUsersForHousehold(householdId);
        const tokens = users.map(user => user.fcmToken).filter(Boolean);

        await checkEntriesAndNotify(householdId, tokens, "Reminder", "Don't forget to log electricity meter data today!")
        res.status(200).json({message:'Notifications sent successfully.'});
    }
    catch (error) {
        console.error('Error sending notification :', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/households/:householdId', authenticate, async(req,res) => {
  try {
    const householdId = req.params.householdId;
    await deleteHousehold(householdId);
    res.status(204).json({message: 'Household deleted.'});
  }
  catch(error) {
    console.error('Error deleting household!', error);
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
