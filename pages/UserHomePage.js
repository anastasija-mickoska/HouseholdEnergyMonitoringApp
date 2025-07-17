import {View, Text,StyleSheet, ScrollView, Alert} from 'react-native';
import PageLayout from '../components/PageLayout';
import WeeklyMonthlyInsight from '../components/WeeklyMonthlyInsight';
import Limits from '../components/Limits';
import UsageComponent from '../components/UsageComponent';
import CustomButton from '../components/CustomButton';
import { auth } from '../firebase';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserHomePage = ({navigation}) => {
    const [householdId, setHouseholdId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [userName, setUserName] = useState('');
    const [householdName, setHouseholdName] = useState('');
    const [weeklyLimit, setWeeklyLimit] = useState('');
    const [monthlyLimit, setMonthlyLimit] = useState('');
    const [weeklyUsage, setWeeklyUsage] = useState(null);
    const [monthlyUsage, setMonthlyUsage] = useState(null);
    const [weeklyCost, setWeeklyCost] = useState(null);
    const [monthlyCost, setMonthlyCost] = useState(null);
    const [totalKWhWeekly, setTotalKWhWeekly] = useState(null);
    const [totalKWhMonthly, setTotalKWhMonthly] = useState(null);

    useEffect(() => {
        const initData = async () => {
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            const storedUserId = await AsyncStorage.getItem('id');
            const fetchedToken = await auth.currentUser.getIdToken();

            setHouseholdId(storedHouseholdId);
            setUserId(storedUserId);
            setToken(fetchedToken);
        };
        initData();
    }, []);

    useEffect(() => {
        if (userId && token) {
            fetchUserName();
        }
    }, [userId, token]);

    useEffect(() => {
        if (householdId && token) {
            fetchUsageLimits();
            fetchElectricityCostAndConsumption();
        }
    }, [householdId, token]);

    useEffect(() => {
        if (userId && token) {
            fetchApplianceUsageForUser();
        }
    }, [userId, token]);

    const fetchUserName = async() => {
        try {
            const res = await fetch(`http://192.168.1.108:8000/users/${userId}`, {
                method:'GET',
                headers: {
                    'Authorization':`Bearer ${token}`
                }
            });
            const json = await res.json();
            if(json.error) {
                Alert.alert(json.error);
            }
            else{
                setUserName(json.name);
            }
        }
        catch(error) {
            console.error(error);
        }
    };

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
                setHouseholdName(json.householdName);
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
            }
        }
        catch(error){
            console.error(error);
        }
    };

    const fetchApplianceUsageForUser = async() => {
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
            }
        }
        catch(error) {
            console.error('Error fetching appliance usage for user!', error);
            throw error;
        }
    };

    const handleAddButton = () => {
        navigation.navigate('Add Usage');
    }

    const handleInsightsButton = () => {
        navigation.navigate('Insights');
    }

    return(
        <PageLayout navigation={navigation}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.welcomeText}>Hi, {userName}!</Text>
                <View style={styles.mainContent}>
                    <View style={styles.household}>
                        <Text style={styles.householdName}>{householdName}</Text> 
                    </View>
                    <UsageComponent week={`${weeklyUsage ?? 0}`} month={`${monthlyUsage ?? 0}`} />
                    <Limits week={weeklyLimit} month={monthlyLimit}/>
                    <WeeklyMonthlyInsight title={'Your Appliance Usage'} texts={['This Week', 'This Month']} values={[`${totalKWhWeekly ?? 0} KWh`, `${totalKWhMonthly ?? 0} KWh`]}/>
                    <CustomButton text={'View Insights'} imgSource={"insights"} onPress={handleInsightsButton}/>
                    <WeeklyMonthlyInsight title={'Electricity Cost'} texts={['This week', 'This month']} values={[`${weeklyCost ?? 0} den`, `${monthlyCost ?? 0} den`]} />
                    <CustomButton text={'Add Energy Usage'} imgSource={"add"} onPress={handleAddButton}/>
                </View>
            </ScrollView>
        </PageLayout>
    );
}

export default UserHomePage;

const styles=StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start', 
        gap: 10,
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    },
    welcomeText: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: '400',
        letterSpacing: 0.8
    },
    mainContent: {
        justifyContent:'center',
        alignItems:'center',
        gap:20,
        marginTop:30
    },
    household: {
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:30,
        paddingVertical:15,
        borderRadius: 20,
        backgroundColor:'#4ADEDE'
    },
    householdName: {
        color: '#F3F3F3',
        fontSize: 20,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
    }
});