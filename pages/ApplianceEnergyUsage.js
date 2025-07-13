import { Alert, StyleSheet, View } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

const ApplianceEnergyUsage = ({ navigation }) => {
    const fields = [
        { name: 'appliance', label: 'Appliance', type: 'picker', placeholder: "Select appliance from below:", required: true },
        { name: 'timeDuration', label: 'Time (hours)', type: 'number', placeholder: "Time (hours)", required: true },
        { name: 'date', label: 'Date', type: 'date', placeholder: "Date:", required: true },
        { name: 'startingTime', label: 'Starting time', type: 'time', placeholder: "Starting time:", required: true },
    ];

    const [householdId, setHouseholdId] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const loadIds = async () => {
            const storedUserId = await AsyncStorage.getItem('id');
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            setUserId(storedUserId);
            setHouseholdId(storedHouseholdId);
        };
        loadIds();
    }, []);

    const handleSubmit = async ({ appliance, timeDuration, date, startingTime }) => {
        try {
            const token = await auth().currentUser.getIdToken();
            const usageData = {
                userId,
                householdId,
                appliance,
                timeDuration,
                date,
                startingTime
            };
            const res = await fetch('http://192.168.1.108:8000/applianceEnergyUsages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usageData)
            });

            if (!res.ok) {
                throw new Error('Failed to submit usage data.');
            }

            const json = await res.json();
            if (json.message === 'Appliance energy usage added.') {
                Alert.alert('Energy usage successfully added.\nTotal KWh consumption:\nTotal electricity cost:');
                navigation.navigate('Home');
            } else {
                Alert.alert(json.error || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error submitting data!', error.message);
        }
    };
    
    return (
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <CustomForm
                    title="Appliance Energy Usage Data"
                    registerQuestion={false}
                    fields={fields}
                    buttonText={"Submit"}
                    buttonIcon={"check"}
                    onSubmit={handleSubmit}
                />
            </View>
        </PageLayout>
    );
};

export default ApplianceEnergyUsage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        width: '100%'
    },
});
