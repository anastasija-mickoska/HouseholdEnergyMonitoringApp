const express = require('express');
const router = express.Router();
const { getAllHouseholds, 
    createHousehold, 
    getHouseholdById, 
    getHouseholdByName,
    joinHousehold, 
    getAllUsers, 
    getUserById,
    getElectricityMeterUsagesForHousehold, 
    getApplianceEnergyUsagesByUser, 
    getApplianceEnergyUsagesForHousehold, 
    addApplianceEnergyUsage, 
    addElectricityMeterUsage, 
    changeUsageLimits, 
    setUserHousehold,
    getNotificationsForHousehold,
    getAppliances,
    getMonthlyElectricityCostAndConsumption,
    getWeeklyApplianceUsageByUser,
    getMonthlyApplianceUsageByUser,
    getWeeklyElectricityCostAndConsumption,
    calculateApplianceUsageConsumptionAndCost
 } = require('./firestoreService');
const authenticate = require('./config/auth');
const { Timestamp } = require('firebase-admin/firestore');

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
    res.status(200).json({message:'User added to household.'});
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

router.patch('/users/:id', authenticate, async(req,res) => {
  try {
    const id = req.params.id;
    const {householdId} = req.body;
    await setUserHousehold(id, householdId);
    res.status(200).json({message:'Household attached to user.'});
  }
  catch(error) {
    res.status(500).json({error: error.message});
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

module.exports = router;
