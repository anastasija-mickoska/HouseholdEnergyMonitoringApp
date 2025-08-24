import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {auth} from '../firebase';
import { PieChart } from "react-native-gifted-charts";

const ApplianceUsageInsight = ({title}) => {
    const [activePeriod, setActivePeriod] = useState('weekly');
    const [applianceBreakdownWeekly, setApplianceBreakdownWeekly] = useState({});
    const [applianceBreakdownMonthly, setApplianceBreakdownMonthly] = useState({});  
    const [totalKWhWeekly, setTotalKWhWeekly] = useState(0);
    const [totalKWhMonthly, setTotalKWhMonthly] = useState(0);
    const [totalCostWeekly, setTotalCostWeekly] = useState(0);
    const [totalCostMonthly, setTotalCostMonthly] = useState(0);
    const [weeklyUsage, setWeeklyUsage] = useState(0);
    const [monthlyUsage, setMonthlyUsage] = useState(0);
    const [data, setData] =useState([]);
    const [pieData, setPieData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            const fetchedToken = await auth.currentUser.getIdToken();
            const storedUserId = await AsyncStorage.getItem('id');

            if (storedHouseholdId && fetchedToken) {
                await fetchElectricityCostAndConsumption(storedHouseholdId, fetchedToken);
            }
            if (storedUserId && fetchedToken && title === 'Your Appliance Usage') {
                await fetchApplianceUsageForUser(storedUserId, fetchedToken);
            } else if (storedHouseholdId && fetchedToken && title === 'Appliance Usage Data') {
                await fetchApplianceUsageForHousehold(storedHouseholdId, fetchedToken);
            }
            await fetchDonutChartData();
            await fetchPieChartData();
            } catch (error) {
            console.error('Error during initialization:', error);
            } finally {
            setLoading(false);
            }
        };
        loadData();
    }, [activePeriod, totalKWhMonthly, totalKWhWeekly,weeklyUsage, monthlyUsage]);

    const fetchDonutChartData = async() => {
        const newData = activePeriod === 'weekly'
        ? [
            { value: totalKWhWeekly, color: '#4ADEDE' },
            { value: weeklyUsage - totalKWhWeekly, color: '#E0E0E0' },
            ]
        : [
            { value: totalKWhMonthly, color: '#4ADEDE' },
            { value: monthlyUsage - totalKWhMonthly, color: '#E0E0E0' },
            ];
        setData(newData);
    };

    const fetchPieChartData = async() => {
        const breakdown = activePeriod === 'weekly' ? applianceBreakdownWeekly : applianceBreakdownMonthly;
        const colors = ['#4ADEDE', '#1AA7EC', '#1F2F98', '#055B5C', '#7FFFD4', '#289C8E'];

        const pieChartData = Object.entries(breakdown).map(([appliance, data], index) => ({
            value: Number(data.kWh),
            color: colors[index % colors.length],
            text: appliance
        }));

        setPieData(pieChartData);
    };

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
                setTotalKWhWeekly(Number(json.totalKWh));
                setTotalCostWeekly(Number(json.totalCost));
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
                setTotalKWhMonthly(Number(jsonResult.totalKWh));
                setTotalCostMonthly(Number(jsonResult.totalCost));
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
                setTotalKWhWeekly(Number(json.totalKWh));
                setTotalCostWeekly(Number(json.totalCost));
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
                setTotalKWhMonthly(Number(jsonResult.totalKWh));
                setTotalCostMonthly(Number(jsonResult.totalCost));
                setApplianceBreakdownMonthly(jsonResult.applianceBreakdown);
            }
        }
        catch(error) {
            console.error('Error fetching appliance usage for user!', error);
            throw error;
        }
    };

    const fetchElectricityCostAndConsumption = async(householdId, token) => {
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
                setWeeklyUsage(Number(json.totalConsumption));
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
                setMonthlyUsage(Number(jsonResult.totalConsumption));
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

    if(loading) {
        return(
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.buttonText}>Loading data...</Text>
            </View>
        )
    }
    const totalCost = activePeriod == 'weekly' ? totalCostWeekly : totalCostMonthly;

    return(
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.charts}>
                {data.length > 0 && 
                    <PieChart donut radius={60} innerRadius={45} data={data} isAnimated={true} centerLabelComponent={() => {
                    const values = [
                    weeklyUsage ?? 0,
                    monthlyUsage ?? 0,
                    totalKWhWeekly ?? 0,
                    totalKWhMonthly ?? 0
                    ];

                    if (values.some(v => v !== 0)) {
                    const usage = activePeriod === 'weekly' ? (weeklyUsage ?? 1) : (monthlyUsage ?? 1);
                    const totalKWh = activePeriod === 'weekly' ? (totalKWhWeekly ?? 0) : (totalKWhMonthly ?? 0);
                    const percentage = ((totalKWh / usage) * 100) || 0;

                    return (
                        <View style={{ alignItems: 'center' }}>
                        <Text style={styles.consumption}>
                            {totalKWh.toFixed(1)} KWh
                        </Text>
                        <Text style={styles.percentage}>
                            {percentage.toFixed(0)}% of total {activePeriod} usage
                        </Text>
                        </View>
                    );
                    } else {
                    return (
                        <View style={{ alignItems: 'center' }}>
                        <Text style={styles.percentage}>No data available</Text>
                        </View>
                    );
                    }
                    }}/>
                }
                {pieData && pieData.length > 1 && (
                    <PieChart radius={60} data={pieData} isAnimated={true} strokeColor="#F3F3F3" strokeWidth={0.75} focusOnPress/>
                )}
            </View>
            <View>
            {pieData && pieData.length > 0 ? (
            <>
                {pieData.map((item, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: item.color, marginRight: 8, borderRadius: 2 }} />
                    <Text style={styles.itemText}> {item.text}: {item.value} KWh </Text>
                </View>
                ))}
                <Text style={styles.totalCostText}> Total cost: {totalCost} den </Text>
            </>
            ) : (
                <Text style={styles.buttonText}> No appliance usage data available. </Text>
            )}
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
        justifyContent:'space-evenly',
        alignItems:'center',
        gap:10
    },
    text: {
        backgroundColor: '#4ADEDE',
        borderRadius: 20,
        padding:10,
        alignItems:'center'
    },
    itemText: {
        color: '#1F2F98',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.6,
        alignItems:'center'
    },
    totalCostText: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: 700,
        letterSpacing: 0.8,
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
    },
    consumption: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: 700,
        letterSpacing: 1,
        textAlign:'center'
    },
    percentage: {
        color: '#1F2F98',
        fontSize: 10,
        fontFamily: 'Roboto Flex',
        fontWeight: 700,
        letterSpacing: 0.60,
        textAlign:'center'
    }
})