import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {auth} from '../firebase';

const ElectricityMeterInsight = () => {
    const [activePeriod, setActivePeriod] = useState('weekly');
    const [weeklyLimit, setWeeklyLimit] = useState(null);
    const [monthlyLimit, setMonthlyLimit] = useState(null);
    const [weeklyUsage, setWeeklyUsage] = useState(null);
    const [monthlyUsage, setMonthlyUsage] = useState(null);
    const [weeklyCost, setWeeklyCost] = useState(null);
    const [monthlyCost, setMonthlyCost] = useState(null);    
    const [householdId, setHouseholdId] = useState(null);
    const [token, setToken] = useState(null);
    const [lowTariffWeekly, setLowTariffWeekly] = useState(null);
    const [lowTariffMonthly, setLowTariffMonthly] = useState(null);
    const [highTariffWeekly, setHighTariffWeekly] = useState(null);
    const [highTariffMonthly, setHighTariffMonthly] = useState(null);

    useEffect(()=> {
        const loadData = async() => {
            const storedUserId = await AsyncStorage.getItem('id');
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            const fetchedToken = await auth.currentUser.getIdToken();
            setHouseholdId(storedHouseholdId);
            setToken(fetchedToken);
            setUserId(storedUserId);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (householdId && token) {
            fetchUsageLimits();
            fetchElectricityCostAndConsumption();
        }
    }, [householdId, token]);

    const fetchUsageLimits = async() => {
        try {
            const res = await fetch(`http://192.168.1.108:8000/households/${householdId}`, {
                method:'GET',
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            });
            const json = await res.json();
            if(json.error) {
                Alert.alert(json.error);
            }
            else {
                setWeeklyLimit(json.weeklyLimit);
                setMonthlyLimit(json.monthlyLimit);
            }
        }catch(error) {
            console.error(error);
        }
    };

    const fetchElectricityCostAndConsumption = async() => {
        try {
            const res = await fetch(`http://192.168.1.108:8000/weeklyElectricityUsage/${householdId}`, {
                method:'GET',
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            });
            const json = await res.json();
            if(json.error) {
                Alert.alert(json.error);
            }
            else {
                setWeeklyCost(json.totalCost);
                setWeeklyUsage(json.totalConsumption);
                setLowTariffWeekly(json.lowTariffConsumption);
                setHighTariffWeekly(json.highTariffConsumption);
            }
            const result = await fetch(`http://192.168.1.108:8000/monthlyElectricityUsage/${householdId}`, {
                method:'GET',
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            });
            const jsonResult = await result.json();
            if(jsonResult.error) {
                Alert.alert(jsonResult.error);
            }
            else {
                setMonthlyCost(jsonResult.totalCost);
                setMonthlyUsage(jsonResult.totalConsumption);
                setLowTariffMonthly(jsonResult.lowTariffConsumption);
                setHighTariffMonthly(jsonResult.highTariffConsumption);
            }
        }
        catch(error){
            console.error(error);
        }
    };

    const handlePressWeekly = () => {
        setActivePeriod('weekly');
    }
    const handlePressMonthly = () => {
        setActivePeriod('monthly');
    }

    const lowTariff = activePeriod === 'weekly' ? lowTariffWeekly : lowTariffMonthly;
    const highTariff = activePeriod === 'weekly' ? highTariffWeekly : highTariffMonthly;
    const totalCost = activePeriod === 'weekly' ? weeklyCost : monthlyCost;

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Electricity Meter Data</Text>
            <View style={styles.charts}>
                <Text>Donut chart</Text>
                <Text>Bar chart</Text>
            </View>
            <View style={styles.text}>
                <Text style={styles.insights}>Low tariff consumption:{lowTariff} KWh</Text>
                <Text style={styles.insights}>High tariff consumption:{highTariff} KWh</Text>
                <Text style={styles.insights}>Total cost:{totalCost} den</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={activePeriod === 'weekly' ? styles.active : styles.button} onPress={handlePressWeekly}>
                    <Text style={activePeriod === 'weekly' ? styles.activeText : styles.buttonText}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={activePeriod === 'monthly' ? styles.active : styles.button} onPress={handlePressMonthly}>
                    <Text style={activePeriod === 'monthly' ? styles.activeText : styles.buttonText}>Monthly</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ElectricityMeterInsight;

const styles = StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        gap:20,
        backgroundColor: 'rgba(26, 167, 236, 0.10)',
        borderRadius:20,
        padding:30,
        width:'100%'
    },
    title: {
        color: '#1F2F98',
        fontSize: 24,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.2
    },
    charts: {
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center'
    },
    text: {
        backgroundColor: '#4ADEDE',
        borderRadius: 20,
        padding:10,
        alignItems:'center'
    },
    insights: {
        color: '#F3F3F3',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.6,
        alignItems:'center'
    },
    buttons: {
        justifyContent:'space-around',
        flexDirection:'row',
        alignItems:'center',
        gap:30
    },
    button: {
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:20,
        paddingVertical:5
    },
    active: {
        borderRadius: 20,
        backgroundColor:'#1AA7EC',
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:20,
        paddingVertical:5
    },
    buttonText: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.5,
    },
    activeText: {
        color: '#F3F3F3',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.5,    
    }

})