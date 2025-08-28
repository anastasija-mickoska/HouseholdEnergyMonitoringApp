import PageLayout from "../components/PageLayout";
import WeeklyMonthlyInsight from "../components/WeeklyMonthlyInsight";
import UsageLimits from '../components/UsageLimits';
import { Alert, StyleSheet, Text, ScrollView, Modal, View } from "react-native";
import { useEffect, useState } from "react";
import { auth } from '../firebase';
import AsyncStorage from "@react-native-async-storage/async-storage";

const ManageUsageLimits = ({navigation}) => {
    const [householdId, setHouseholdId] = useState(null);
    const [weeklyLimit, setWeeklyLimit] = useState('0');  
    const [monthlyLimit, setMonthlyLimit] = useState('0'); 
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [modalVisibleLimits, setModalVisibleLimits] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            setHouseholdId(storedHouseholdId);
            const fetchedToken = await auth.currentUser.getIdToken();
            setToken(fetchedToken);
            const storedRole = await AsyncStorage.getItem('role');
            setRole(storedRole);
        };
        loadData();
    }, []);

    useEffect(() => { 
        const fetchUsageLimits = async () => {
            try {
                const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/households/${householdId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const json = await res.json();
                if (!json || json.error) {
                    Alert.alert(json?.error || 'No household data found.');
                    return;
                }
                setWeeklyLimit(json.weeklyLimit ?? 0);
                setMonthlyLimit(json.monthlyLimit ?? 0);
            } catch (error) {
                console.error(error);
                Alert.alert('Error fetching usage limits.', error.message);
            }
        };
        if (householdId && token) {
            fetchUsageLimits();
        }
    }, [householdId, token]);

    const saveLimits = async (newLimits) => {
        setWeeklyLimit(newLimits.weeklyLimit.toString());
        setMonthlyLimit(newLimits.monthlyLimit.toString());
        try {
            const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/households/${householdId}/limits`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newLimits) 
            });
            const json = await res.json();
            if (json.message && json.message === 'Limits saved.') {
                setModalVisibleLimits(true);
                setTimeout(() => {
                    setModalVisibleLimits(false);
                    if(role === 'Admin') {
                        navigation.navigate('Admin Home');
                    }
                    else if(role === 'User') {
                        navigation.navigate('User Home');
                    }
                }, 3000);
            } else {
                Alert.alert(json.error || 'Error saving limits.');
            }
        } catch (error) {
            Alert.alert('Error saving data!', error.message);
        }
    };

    return (
        <PageLayout navigation={navigation}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Manage Usage Limits</Text>
                <WeeklyMonthlyInsight 
                    title={'Usage Limits'}
                    texts={['Weekly limit', 'Monthly limit']} 
                    values={[
                        `${weeklyLimit} KWh`,
                        `${monthlyLimit} KWh`
                    ]}/>
                <UsageLimits 
                    weeklyLimit={weeklyLimit} 
                    monthlyLimit={monthlyLimit} 
                    onSave={saveLimits} />
            </ScrollView>
            <Modal transparent={true} visible={modalVisibleLimits} animationType="fade">
                <View style={styles.modal}>
                    <Text style={styles.modalText}>
                        Limits saved successfully.
                    </Text>
                </View>
            </Modal>
        </PageLayout>
    );
}

export default ManageUsageLimits;

const styles = StyleSheet.create({
    container: {
        flexGrow:1,
        padding:20,
        flexDirection:'column',
        justifyContent:'flex-start',
        alignItems:'center',
        gap:30
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6,
    },
    modal: {
      flex: 1,
      width:'100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding:20
    },
    modalText: {
        backgroundColor:'#4ADEDE',
        color: '#F3F3F3',
        padding: 20,
        borderRadius: 10,
        textAlign: 'center'
    }
});
