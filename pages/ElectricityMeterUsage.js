import { StyleSheet, View, Alert } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ElectricityMeterUsage = ({navigation}) => {
    const fields = [
        { name: 'highTariff', label: 'High tariff consumption (KWh)', type: 'number', placeholder: "Enter high tariff consumption (KWh)...", required: true },
        { name: 'lowTariff', label: 'Low tariff consumption (KWh)', type: 'number', placeholder: "Enter low tariff consumption (KWh)...", required: true },
        { name: 'electricityMeterSubmitDate', label: 'Date', type: 'date', placeholder: "Select date...", required: true },
    ];

  const [householdId, setHouseholdId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
      const loadData = async () => {
          const storedUserId = await AsyncStorage.getItem('id');
          const storedHouseholdId = await AsyncStorage.getItem('householdId');
          const storedRole = await AsyncStorage.getItem('role');
          setUserId(storedUserId);
          setHouseholdId(storedHouseholdId);
          setRole(storedRole);
      };
      loadData();
  }, []);

    const handleSubmit = async ({highTariff, lowTariff, electricityMeterSubmitDate}) => {
        try {
          const token = await auth.currentUser.getIdToken();
          const usageData = {
            userId:userId,
            householdId: householdId,
            highTariff: highTariff,
            lowTariff: lowTariff,
            date: electricityMeterSubmitDate,
          };
          const res = await fetch('http://192.168.1.108:8000/electricityMeterUsages', {
            method:'POST',
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
          if(json.message == 'Electricity meter usage added.') {
            //also here totalConsumption and totalCost should be calculated
            //modal instead of built-in alert for styling purposes
            Alert.alert('Energy usage successfully added. Total KWh consumption: Total electricity cost: ');
            if(role === 'Admin') {
                navigation.navigate('Admin Home');
            }
            else if(role === 'User') {
                navigation.navigate('User Home');
            }
          }
          else {
            Alert.alert(json.error || 'Unknown error');
          }
        }
        catch(error) {
          Alert.alert('Error submitting data!', error.message);
        }
    }

  return (
    <PageLayout navigation={navigation}>
      <View style={styles.container}>
        <CustomForm
          title="Electricity Meter Data"
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

export default ElectricityMeterUsage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:'100%',
    padding:30
  },
});

