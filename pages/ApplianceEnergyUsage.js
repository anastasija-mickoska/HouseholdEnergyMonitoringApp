import { Alert, StyleSheet, View } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import { use, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { app } from 'firebase-admin';

const ApplianceEnergyUsage = ({navigation}) => {
    const fields = [
        { name: 'appliance', label: 'Appliance', type: 'picker', placeholder: "Select appliance from below:", required: true },
        { name: 'timeDuration', label: 'Time (hours)', type: 'number', placeholder: "Time (hours)", required: true },
        { name: 'date', label: 'Date', type: 'date', placeholder: "Date:", required: true },
        { name: 'startingTime', label: 'Date', type: 'time', placeholder: "Starting time:", required: true },
    ];

    const [householdId, setHouseholdId] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
    const getUserId = async () => {
        const storedUserId = await AsyncStorage.getItem('id');
        setUserId(storedUserId);
    };
    getUserId();
    const getHouseholdId = async () => {
        const storedHouseholdId = await AsyncStorage.getItem('householdId');
        setHouseholdId(storedHouseholdId);
    };
    getHouseholdId();
    }, []);

    const handleSubmit = async ({appliance, timeDuration, date, startingTime}) => {
        try {
            const token = auth().currentUser.getIdToken();
            const usageData = {
                userId: userId,
                householdId: householdId,
                appliance: appliance,
                timeDuration: timeDuration,
                date: date,
                startingTime: startingTime
            };
            const res = await fetch('http://192.168.1.108:8000/applianceEnergyUsages', {
                method:'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usageData)
            });
            const json = await res.json();
            if(json.message && json.message == 'Appliance energy usage added.') {
                //total consumption and cost to be calculated
                //modal
                Alert.alert('Energy usage successfully added.Total KWh consumption:Total electricity cost:');
                navigation.navigate('Home');
            }
            else {
                Alert.alert(json.error);
            }
        }
        catch(error) {
            Alert.alert('Error submitting data!',error.message);
        }
    }
    
    return (
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
            <CustomForm
                title="Appliance Energy Usage Data"
                registerQuestion={false}
                fields={fields}
                buttonText={"Submit"}
                buttonIcon={"check"} 
                onSubmit = {handleSubmit}
            />
            </View>
        </PageLayout>
    );
};

export default ApplianceEnergyUsage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:30,
    width:'100%'
  },
});


