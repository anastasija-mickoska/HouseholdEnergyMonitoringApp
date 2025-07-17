import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {auth} from '../firebase';

const ApplianceUsageInsight = ({title}) => {
    const [activePeriod, setActivePeriod] = useState('weekly');
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [householdId, setHouseholdId] = useState(null);
    const [applianceBreakdownWeekly, setApplianceBreakdownWeekly] = useState({});
    const [applianceBreakdownMonthly, setApplianceBreakdownMonthly] = useState({});
    const [totalKWhWeekly, setTotalKWhWeekly] = useState(null);
    const [totalKWhMonthly, setTotalKWhMonthly] = useState(null);
    const [totalCostWeekly, setTotalCostWeekly] = useState(null);
    const [totalCostMonthly, setTotalCostMonthly] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const storedUserId = await AsyncStorage.getItem('id');
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            const fetchedToken = await auth.currentUser.getIdToken();
            setHouseholdId(storedHouseholdId);
            setToken(fetchedToken);
            setUserId(storedUserId);

            if (storedUserId && fetchedToken && title === 'Your Appliance Usage') {
                fetchApplianceUsageForUser(storedUserId, fetchedToken);
            }
            else if(storedHouseholdId && fetchedToken && title === 'Appliance Usage Data') {
                fetchApplianceUsageForHousehold(storedHouseholdId, fetchedToken);
            }
        };
        loadData();
    }, []);


    //todo: check this method, it is not fetching data
    const fetchApplianceUsageForHousehold = async(householdId, token) => {
        try {
            const res = await fetch(`http://192.168.1.108:8000/applianceEnergyUsages?householdId=${householdId}&type=weekly`, {
                method:'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if(json.error) {
                Alert.alert(json.error);
            }
            else {
                setTotalKWhWeekly(json.totalKWh);
                setTotalCostWeekly(json.totalCost);
                setApplianceBreakdownWeekly(json.applianceBreakdown);
            }
            const result = await fetch(`http://192.168.1.108:8000/applianceEnergyUsages?householdId=${householdId}&type=monthly`, {
                method:'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const jsonResult = await result.json();
            if(jsonResult.error) {
                Alert.alert(jsonResult.error);
            }
            else {
                setTotalKWhMonthly(jsonResult.totalKWh);
                setTotalCostMonthly(jsonResult.totalCost);
                setApplianceBreakdownMonthly(jsonResult.applianceBreakdown);
            }
        }
        catch(error) {
            console.error('Error fetching appliance usage for user!', error);
            throw error;
        }
    };

    const fetchApplianceUsageForUser = async(userId, token) => {
        try {
            const res = await fetch(`http://192.168.1.108:8000/applianceEnergyUsages?userId=${userId}&type=weekly`, {
                method:'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if(json.error) {
                Alert.alert(json.error);
            }
            else {
                setTotalKWhWeekly(json.totalKWh);
                setTotalCostWeekly(json.totalCost);
                setApplianceBreakdownWeekly(json.applianceBreakdown);
            }
            const result = await fetch(`http://192.168.1.108:8000/applianceEnergyUsages?userId=${userId}&type=monthly`, {
                method:'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const jsonResult = await result.json();
            if(jsonResult.error) {
                Alert.alert(jsonResult.error);
            }
            else {
                setTotalKWhMonthly(jsonResult.totalKWh);
                setTotalCostMonthly(jsonResult.totalCost);
                setApplianceBreakdownMonthly(jsonResult.applianceBreakdown);
            }
        }
        catch(error) {
            console.error('Error fetching appliance usage for user!', error);
            throw error;
        }
    };

    const handlePressWeekly = () => {
        setActivePeriod('weekly');
    }
    const handlePressMonthly = () => {
        setActivePeriod('monthly');
    }

    const totalCost = activePeriod == 'weekly' ? totalCostWeekly : totalCostMonthly;
    const applianceBreakdown = activePeriod == 'weekly' ? applianceBreakdownWeekly : applianceBreakdownMonthly;

    return(
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.charts}>
                <Text>Donut chart</Text>
                <Text>Pie chart</Text>
            </View>
            <View style={styles.text}>
                {Object.keys(applianceBreakdown).length === 0 ? (
                    <Text style={styles.insights}>No appliance data available.</Text>
                ) : (
                    Object.entries(applianceBreakdown).map(([appliance, data]) => (
                        <Text key={appliance} style={styles.insights}>
                            {appliance}: {data.kWh} kWh
                        </Text>
                    ))
                )}
                <Text style={styles.insights}>Total cost: {totalCost} den</Text>
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

export default ApplianceUsageInsight;

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