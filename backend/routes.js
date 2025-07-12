const express = require('express');
const router = express.Router();
const { getAllHouseholds, 
    createHousehold, 
    getHouseholdById, 
    joinHousehold, 
    getAllUsers, 
    getUserById,
    getElectricityMeterUsagesForHousehold, 
    getApplianceEnergyUsagesByUser, 
    getApplianceEnergyUsagesForHousehold, 
    addApplianceEnergyUsage, 
    addElectricityMeterUsage, 
    changeUsageLimits, 
    getNotificationsForHousehold } = require('./firestoreService');
const authenticate = require('./config/auth');


//needs to be modified to pass parameters to the functions 
router.get('/households', authenticate, getAllHouseholds); //get request to retrieve all households
router.post('/households', authenticate, createHousehold); //post request to create a household
router.get('/households/:householdId', authenticate, getHouseholdById); //get request for getting the particular household
router.post('/households/:householdId', authenticate, joinHousehold); //post request for joining household with the particular id
router.get('/users', authenticate, getAllUsers); 
router.get('/users/:id', authenticate, getUserById);
router.get('/electricityMeterUsages/:householdId', authenticate, getElectricityMeterUsagesForHousehold);
router.get('/applianceEnergyUsages', authenticate, async (req, res) => {
  try {
    if (req.query.householdId) {
        return getApplianceEnergyUsagesForHousehold(req, res);
    } else if (req.query.userId) {
        return getApplianceEnergyUsagesByUser(req, res);
    } else {
      return res.status(400).json({ error: 'Missing householdId or userId in query.' });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
router.post('/electricityMeterUsages', authenticate, addElectricityMeterUsage);
router.post('/applianceEnergyUsages', authenticate, addApplianceEnergyUsage);
router.put('/households/:householdId', authenticate, changeUsageLimits);
router.get('/notifications/:householdId', authenticate, getNotificationsForHousehold);

module.exports = router;
