import { StyleSheet, View, Alert, Modal, Text } from 'react-native';
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
  const [totalKWh, setTotalKwh] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [modalVisibleElectricityMeter, setModalVisibleElectricityMeter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setIsSubmitting(true);
          const token = await auth.currentUser.getIdToken();
          const usageData = {
            userId:userId,
            householdId: householdId,
            highTariff: Number(highTariff),
            lowTariff: Number(lowTariff),
            date: new Date(electricityMeterSubmitDate),
          };
          const res = await fetch('https://household-energy-backend.ey.r.appspot.com/electricityMeterUsages', {
            method:'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(usageData)
          });
          const json = await res.json();

          if(res.ok) {
            if(json.message == 'Electricity meter usage added.') {
              setTotalKwh(json.totalKWh);
              setTotalCost(json.totalCost);
              setModalVisibleElectricityMeter(true);
              setIsSubmitting(false);
              setTimeout(() => {
                  setModalVisibleElectricityMeter(false);
                  if(role === 'Admin') {
                      navigation.navigate('Admin Home');
                  }
                  else if(role === 'User') {
                      navigation.navigate('User Home');
                  }
              }, 3000);
            }
          }
          else {
              Alert.alert('Failed to submit data!', json.error || 'Unknown error');
          }
        }
        catch(error) {
          setIsSubmitting(false);
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
          buttonText={isSubmitting ? "Submitting...":"Submit"}
          buttonIcon={"check"} 
          onSubmit = {handleSubmit}
          isSubmitting={isSubmitting}
        />
        <Modal transparent={true} visible={modalVisibleElectricityMeter} animationType="fade">
          <View style={styles.modal}>
              <View>
                  <Text style={styles.modalText}>
                      Electricity meter usage successfully added.{"\n"}
                      Total consumption since last electricity meter reading: {totalKWh} KWh.{"\n"}
                      Total estimated cost: {totalCost} den
                  </Text>
              </View>
          </View>
        </Modal>
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

