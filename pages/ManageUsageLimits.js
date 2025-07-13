import PageLayout from "../components/PageLayout";
import WeeklyMonthlyInsight from "../components/WeeklyMonthlyInsight";
import UsageLimits from '../components/UsageLimits';
import { Alert, StyleSheet, Text, View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import auth from '@react-native-firebase/auth';

const ManageUsageLimits = ({navigation}) => {
  const [householdId, setHouseholdId] = useState(null);

  useEffect(() => {
    const getHouseholdId = async () => {
      const storedHouseholdId = await AsyncStorage.getItem('householdId');
      setHouseholdId(storedHouseholdId);
    };
    getHouseholdId();
  }, []);

    const saveLimits = async ({weekly, monthly}) => {
        try {
            const token = auth().currentUser.getIdToken();
            const limits = {
                weeklyLimit:weekly,
                monthlyLimit:monthly
            };
            const res = await fetch(`http://192.168.1.108:8000/households/${householdId}/limits`, {
                method:'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(limits)
            });
            const json = await res.json();
            if(json.message && json.message == 'Limits saved.') {
                Alert.alert('Limits saved successfully.');
                navigation.navigate('Home');
            }
            else {
                Alert.alert(json.error);
            }
        }
        catch(error) {
            Alert.alert('Error saving data!', error.message);
        }
    }

    return(
        <PageLayout navigation={navigation}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Manage Usage Limits</Text>
                <WeeklyMonthlyInsight texts={['Weekly limit', 'Monthly limit']} values={[60,200]}/>
                <UsageLimits weeklyLimit={60} monthlyLimit={200} handleSave={saveLimits}/>
            </ScrollView>
        </PageLayout> 
    );
}

export default ManageUsageLimits;

const styles=StyleSheet.create({
    container: {
        flexGrow:1,
        padding:20,
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        gap:20
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    }
});