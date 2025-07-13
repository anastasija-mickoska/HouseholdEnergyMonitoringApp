import {View, Text,StyleSheet, ScrollView, Alert} from 'react-native';
import PageLayout from '../components/PageLayout';
import WeeklyMonthlyInsight from '../components/WeeklyMonthlyInsight';
import UsageComponent from '../components/UsageComponent';
import CustomButton from '../components/CustomButton';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

const AdminHomePage = ({ navigation }) => {
    const [householdId, setHouseholdId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [userName, setUserName] = useState('');
    const [householdName, setHouseholdName] = useState('');
    const [weeklyLimit, setWeeklyLimit] = useState('');
    const [monthlyLimit, setMonthlyLimit] = useState('');

    useEffect(() => {
        const initData = async () => {
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            const storedUserId = await AsyncStorage.getItem('id');
            const fetchedToken = await auth().currentUser.getIdToken();

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
        }
    }, [householdId, token]);


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
    //still to fetch electricity cost and usage

    const handleInsightsButton = () => {
        navigation.navigate('Insights');
    }
    const handleUsageLimitsButton = () => {
        navigation.navigate('Manage Usage Limits');
    }
    const handleAddButton = () => {
        navigation.navigate('Add Usage');
    }    

    return (
        <PageLayout navigation={navigation}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.welcomeText}>Hi, {userName}!</Text>
            <View style={styles.mainContent}>
                <View style={styles.household}>
                    <Text style={styles.householdName}>{householdName}</Text> 
                </View>
                <UsageComponent week={50} month={150} />
                <WeeklyMonthlyInsight title={'Electricity cost'} texts={['This week', 'This month']} values={[1240, 4520]} />
                <CustomButton text={'View Insights'} imgSource={"insights"} onPress={handleInsightsButton} />
                <WeeklyMonthlyInsight title={'Usage Limits'} texts={['Weekly limit', 'Monthly limit']} values={[{weeklyLimit}, {monthlyLimit}]} />
                <CustomButton text={'Manage Usage Limits'} imgSource={"edit"} onPress={handleUsageLimitsButton} />
                <CustomButton text={'Add Energy Usage'} imgSource={"add"} onPress={handleAddButton}/>
            </View>
        </ScrollView>
        </PageLayout>
    );
};

export default AdminHomePage;

const styles=StyleSheet.create({
    scrollContainer: {
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
        padding:10,
        width: '70%',
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