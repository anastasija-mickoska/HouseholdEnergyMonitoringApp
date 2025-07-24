import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {auth} from '../firebase';
import {BarChart, PieChart} from 'react-native-gifted-charts';

const ElectricityMeterInsight = () => {
    const [activePeriod, setActivePeriod] = useState('weekly');
    const [weeklyLimit, setWeeklyLimit] = useState(0);
    const [monthlyLimit, setMonthlyLimit] = useState(0);
    const [weeklyUsage, setWeeklyUsage] = useState(0);
    const [monthlyUsage, setMonthlyUsage] = useState(0);
    const [weeklyCost, setWeeklyCost] = useState(0);
    const [monthlyCost, setMonthlyCost] = useState(0);    
    const [householdId, setHouseholdId] = useState(null);
    const [token, setToken] = useState(null);
    const [lowTariffWeekly, setLowTariffWeekly] = useState(0);
    const [lowTariffMonthly, setLowTariffMonthly] = useState(0);
    const [highTariffWeekly, setHighTariffWeekly] = useState(0);
    const [highTariffMonthly, setHighTariffMonthly] = useState(0);
    const [data, setData] = useState([]);
    const [chartDataWeekly, setChartDataWeekly] = useState([]);
    const [chartDataMonthly, setChartDataMonthly] = useState([]);
    const [value2Weekly,setValue2Weekly] = useState(0);
    const [value2Monthly,setValue2Monthly] = useState(0);
    const [loading, setLoading] = useState(true);

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
        const fetchData = async () => {
            try {
                if (!householdId || !token) return;
                await fetchUsageLimits();
                await fetchElectricityCostAndConsumption();
                await fetchPreviousConsumption();
            } catch (error) {
                console.error('Error fetching data!', error);
            }
        };
        fetchData();
    }, [householdId, token, activePeriod]);

    useEffect(() => {
        const fetchDonutChartData = async() => {
            try {
                if (weeklyUsage != null && weeklyLimit != null && monthlyUsage != null && monthlyLimit != null) {
                    fetchActivePeriodData();
                }
            }
            catch(error) {
                console.error('Error setting data!', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchDonutChartData();
    }, [weeklyUsage, weeklyLimit, monthlyUsage, monthlyLimit, activePeriod]);

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
                setWeeklyLimit(Number(json.weeklyLimit));
                setMonthlyLimit(Number(json.monthlyLimit));
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
                setWeeklyCost(Number(json.totalCost));
                setWeeklyUsage(Number(json.totalConsumption));
                setLowTariffWeekly(Number(json.lowTariffConsumption));
                setHighTariffWeekly(Number(json.highTariffConsumption));
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
                setMonthlyCost(Number(jsonResult.totalCost));
                setMonthlyUsage(Number(jsonResult.totalConsumption));
                setLowTariffMonthly(Number(jsonResult.lowTariffConsumption));
                setHighTariffMonthly(Number(jsonResult.highTariffConsumption));
            }
        }
        catch(error){
            console.error(error);
        }
    };

    const fetchPreviousConsumption = async() => {
        try {
            const res = await fetch(`http://192.168.1.108:8000/previousWeeksUsages/${householdId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const json = await res.json();
            if(json.error) {
                Alert.alert(json.error);
            }
            else {
                setChartDataWeekly(json.map((item,index) => ({
                    value: parseFloat(item.consumption),
                    label: item.weekLabel,
                    frontColor: index === json.length - 1 ? '#1F2F98' : '#4ADEDE'
                })));
            }
            const result = await fetch(`http://192.168.1.108:8000/previousMonthsUsages/${householdId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const jsonResult = await result.json();
            if(jsonResult.error) {
                Alert.alert(jsonResult.error);
            }
            else {
                setChartDataMonthly(jsonResult.map((item,index) => ({
                    value: parseFloat(item.consumption),
                    label: item.monthLabel,
                    frontColor: index === jsonResult.length - 1 ? '#1F2F98' : '#4ADEDE'
                })));
            }
        }
        catch(error) {
            console.error(error);
        }
    }

    const fetchActivePeriodData = async() => {
        let usage = activePeriod === 'weekly' ? weeklyUsage : monthlyUsage;
        let limit = activePeriod === 'weekly' ? weeklyLimit : monthlyLimit;

        if (typeof usage !== 'number' || typeof limit !== 'number') return;

        let remaining = Math.max(0, limit - usage);

        if (activePeriod === 'weekly') {
            setValue2Weekly(remaining);
        } else {
            setValue2Monthly(remaining);
        }

        const newData = [
            { value: usage, color: '#4ADEDE' },
            { value: remaining, color: '#E0E0E0' }
        ];
        setData(newData);
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
    const barChartData = activePeriod === 'weekly' ? chartDataWeekly : chartDataMonthly;

    const isDataReady =
    (activePeriod === 'weekly'
        ? weeklyUsage && weeklyLimit
        : monthlyUsage && monthlyLimit) &&
    data.length > 0 &&
    barChartData.length > 0;

    if(loading || !isDataReady) {
        return(
            <View style={styles.container}>
                <Text style={styles.title}>Electricity Meter Data</Text>
                <Text style={styles.buttonText}>Loading data...</Text>
            </View>
        )
    }

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Electricity Meter Data</Text>
            <View style={styles.charts}>
                {console.log("Donut chart data:", data)}
                <PieChart donut radius={60} innerRadius={45} data={data} isAnimated={true} centerLabelComponent={() => {
                    if(weeklyUsage != null && monthlyUsage !=null && weeklyLimit!= null && monthlyLimit !=null) {
                        const usage = activePeriod === 'weekly' ? (weeklyUsage ?? 0) : (monthlyUsage ?? 0);
                        const limit = activePeriod === 'weekly' ? (weeklyLimit ?? 1) : (monthlyLimit ?? 1);
                        const percentage = ((usage / limit) * 100) || 0;
                        return (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.consumption}>
                                    {usage.toLocaleString()} KWh
                                </Text>
                                <Text style={styles.percentage}>{percentage.toFixed(0)}% of limit</Text>
                            </View>
                        );
                    }
                    else {
                        return(
                            <View style={{ alignItems: 'center' }}>
                                <Text style={styles.percentage}>No data available</Text>
                            </View>  
                        )
                    }
                }}/>
                {barChartData.length > 0 && 
                    <BarChart data={barChartData}
                    barWidth={8} 
                    barBorderRadius={8}
                    height={100}
                    width={100}
                    spacing={12}
                    yAxisColor="transparent"
                    xAxisColor={'#1F2F98'}
                    xAxisLabelTextStyle={{ color: '#1F2F98', fontSize: 6, }}
                    yAxisTextStyle={{ color: '#1F2F98', fontSize: 6 }}
                    isAnimated animationDuration={800}/>
                }
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
        paddingVertical:30,
        paddingHorizontal:20,
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