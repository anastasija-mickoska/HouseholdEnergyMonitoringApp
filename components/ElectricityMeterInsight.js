import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {auth} from '../firebase';
import {BarChart, PieChart} from 'react-native-gifted-charts';

const ElectricityMeterInsight = () => {
    const [activePeriod, setActivePeriod] = useState('daily');
    const [weeklyLimit, setWeeklyLimit] = useState(0);
    const [monthlyLimit, setMonthlyLimit] = useState(0);
    const [dailyUsage, setDailyUsage] = useState(0);
    const [weeklyUsage, setWeeklyUsage] = useState(0);
    const [monthlyUsage, setMonthlyUsage] = useState(0);
    const [dailyCost, setDailyCost] = useState(0);
    const [weeklyCost, setWeeklyCost] = useState(0);
    const [monthlyCost, setMonthlyCost] = useState(0);    
    const [lowTariffDaily, setLowTariffDaily] = useState(0);
    const [lowTariffWeekly, setLowTariffWeekly] = useState(0);
    const [lowTariffMonthly, setLowTariffMonthly] = useState(0);
    const [highTariffDaily, setHighTariffDaily] = useState(0);
    const [highTariffWeekly, setHighTariffWeekly] = useState(0);
    const [highTariffMonthly, setHighTariffMonthly] = useState(0);
    const [data, setData] = useState([]);
    const [chartDataDaily, setChartDataDaily] = useState([]);
    const [chartDataWeekly, setChartDataWeekly] = useState([]);
    const [chartDataMonthly, setChartDataMonthly] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=> {
        const loadData = async() => {
            try {
                setLoading(true);
                const storedHouseholdId = await AsyncStorage.getItem('householdId');
                const fetchedToken = await auth.currentUser.getIdToken();
                await fetchUsageLimits(storedHouseholdId, fetchedToken);
                await fetchElectricityCostAndConsumption(storedHouseholdId, fetchedToken);
                await fetchPreviousConsumption(storedHouseholdId, fetchedToken);
                await fetchActivePeriodData();
            }
            catch (error) {
                console.error('Error fetching data!', error);
            } finally {
                setLoading(false); 
            }
        }
        loadData();
    }, [dailyUsage, weeklyUsage, monthlyUsage, weeklyLimit, monthlyLimit,activePeriod]);

    const fetchUsageLimits = async(householdId, token) => {
        try {
            const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/households/${householdId}`, {
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

    const fetchElectricityCostAndConsumption = async(householdId, token) => {
        try {
            const r = await fetch(`https://household-energy-backend.ey.r.appspot.com/dailyElectricityUsage/${householdId}`, {
                method:'GET',
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            });
            const j = await r.json();
            if(j.error) {
                Alert.alert(j.error);
            }
            else {
                setDailyCost(Number(j.totalCost));
                setDailyUsage(Number(j.totalConsumption));
                setLowTariffDaily(Number(j.lowTariffConsumption));
                setHighTariffDaily(Number(j.highTariffConsumption));
            }
            const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/weeklyElectricityUsage/${householdId}`, {
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
            const result = await fetch(`https://household-energy-backend.ey.r.appspot.com/monthlyElectricityUsage/${householdId}`, {
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

    const fetchPreviousConsumption = async(householdId, token) => {
        try {
            const r = await fetch(`https://household-energy-backend.ey.r.appspot.com/previousDaysUsages/${householdId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const j = await r.json();
            if(j.error) {
                Alert.alert(json.error);
            }
            else {
                setChartDataDaily(j.map((item,index) => ({
                    value: parseFloat(item.consumption),
                    label: item.dayLabel,
                    frontColor: index === j.length - 1 ? '#1F2F98' : '#4ADEDE'
                })));
            }
            const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/previousWeeksUsages/${householdId}`, {
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
            const result = await fetch(`https://household-energy-backend.ey.r.appspot.com/previousMonthsUsages/${householdId}`, {
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
        let usage = activePeriod === 'daily' ? dailyUsage : (activePeriod === 'weekly' ? weeklyUsage : monthlyUsage);
        let limit = activePeriod === 'weekly' || activePeriod === 'daily' ? weeklyLimit : monthlyLimit;

        if (typeof usage !== 'number' || typeof limit !== 'number') return;

        let remaining = Math.max(0, limit - usage);

        const newData = [
            { value: usage, color: '#4ADEDE' },
            { value: remaining, color: '#E0E0E0' }
        ];
        setData(newData);
    };

    const handlePressDaily = () => {
        setActivePeriod('daily');
    }
    const handlePressWeekly = () => {
        setActivePeriod('weekly');
    }
    const handlePressMonthly = () => {
        setActivePeriod('monthly');
    }

    const activePeriodState = {
    daily: { low: lowTariffDaily, high: highTariffDaily, cost: dailyCost, chart: chartDataDaily },
    weekly: { low: lowTariffWeekly, high: highTariffWeekly, cost: weeklyCost, chart: chartDataWeekly },
    monthly: { low: lowTariffMonthly, high: highTariffMonthly, cost: monthlyCost, chart: chartDataMonthly },
    };

    const { low: lowTariff, high: highTariff, cost: totalCost, chart: barChartData } =
    activePeriodState[activePeriod] || activePeriodState.weekly; 

    const allValuesZeroBarChart = barChartData.every((item) => item.value === 0);
    const allValuesZeroDonutChart = data.every((item) => item.value === 0);
    const maxValue = Math.max(...barChartData.map(item => item.value));

    const desiredNoSections = (maxValue <= 300) ? ((maxValue <= 50) ? Math.ceil(maxValue/10) : Math.ceil(maxValue / 50)) : Math.ceil(maxValue/100);
    let stepValue = 50;
    if(maxValue < 50) {
        stepValue = 10;
    }
    if (stepValue * desiredNoSections < maxValue) {
        stepValue = 100;
    }
    const roundedMax = stepValue * desiredNoSections;

    if(loading) {
        return(
            <View style={styles.container}>
                <Text style={styles.title}>Electricity Meter Data</Text>
                <Text style={styles.buttonText}>Loading data...</Text>
            </View>
        )
    }

    const hasChartData = !allValuesZeroDonutChart && !allValuesZeroBarChart && !loading;
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Electricity Meter Data</Text>
            {hasChartData ? (
                <>
                    <View style={styles.charts}>
                        <PieChart donut radius={60} innerRadius={45} data={data} isAnimated={true} centerLabelComponent={() => {
                            if ((activePeriod === 'daily' && dailyUsage > 0 && weeklyLimit > 0) || (activePeriod === 'weekly' && weeklyUsage > 0 && weeklyLimit > 0) ||(activePeriod === 'monthly' && monthlyUsage > 0 && monthlyLimit > 0)) {
                                const usage = activePeriod === 'daily' ? dailyUsage : (activePeriod === 'weekly' ? weeklyUsage : monthlyUsage);
                                const limit = activePeriod === 'weekly' || activePeriod === 'daily' ? weeklyLimit : monthlyLimit;
                                const percentage = limit > 0 ? (usage / limit) * 100 : 0;
                                return (
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.consumption}>
                                            {usage.toLocaleString()} KWh
                                        </Text>
                                        {activePeriod === 'daily' || activePeriod === 'weekly' ? 
                                            <Text style={styles.percentage}>{percentage.toFixed(0)}% of weekly limit</Text>
                                            :
                                            <Text style={styles.percentage}>{percentage.toFixed(0)}% of monthly limit</Text>
                                        }
                                    </View>
                                );
                            }
                            else {
                                return(
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={styles.consumption}>
                                            0 KWh
                                        </Text>
                                        <Text style={styles.percentage}>0% of limit</Text>
                                    </View>
                                )
                            }
                        }}/>
                        <BarChart
                            data={barChartData}
                            barWidth={8} 
                            barBorderRadius={8}
                            height={100}
                            spacing={15}
                            yAxisColor="transparent"
                            xAxisColor={'#1F2F98'}
                            xAxisLabelTextStyle={{ color: '#1F2F98', fontSize: 6 }}
                            yAxisTextStyle={{ color: '#1F2F98', fontSize: 6 }}
                            isAnimated
                            maxValue={roundedMax}
                            noOfSections={desiredNoSections}
                            stepValue={stepValue}
                            animationDuration={800}
                        />
                    </View>
                    <View style={styles.text}>
                        <Text style={styles.insights}>Low tariff consumption: {lowTariff} KWh</Text>
                        <Text style={styles.insights}>High tariff consumption: {highTariff} KWh</Text>
                        <Text style={styles.insights}>Total cost: {totalCost} den</Text>
                    </View>
                </>
            ) : (
                <Text style={styles.buttonText}>No electricity meter data available</Text>
            )}
            <View style={styles.buttons}>
                <TouchableOpacity style={activePeriod === 'daily' ? styles.active : styles.button} onPress={handlePressDaily}>
                    <Text style={activePeriod === 'daily' ? styles.activeText : styles.buttonText}>Daily</Text>
                </TouchableOpacity>
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
        justifyContent:'space-between',
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
        gap:20
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