import { StyleSheet, View, Alert } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';

const ElectricityMeterUsage = ({navigation}) => {
    const fields = [
        { name: 'highTariff', label: 'High tariff consumption (KWh)', type: 'number', placeholder: "Enter high tariff consumption (KWh)...", required: true },
        { name: 'lowTariff', label: 'Low tariff consumption (KWh)', type: 'number', placeholder: "Enter low tariff consumption (KWh)...", required: true },
        { name: 'electricityMeterSubmitDate', label: 'Date', type: 'date', placeholder: "Select date...", required: true },
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

    const handleSubmit = async ({highTariff, lowTariff, electricityMeterSubmitDate}) => {
        try {
          const token = auth().currentUser.getIdToken();
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
            navigation.navigate('Home');
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

