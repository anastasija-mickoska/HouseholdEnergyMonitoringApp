import { StyleSheet, View, Alert} from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';

const CreateHousehold = ({navigation}) => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'text', placeholder: "Enter household name...", required: true },
    { name: 'address', label: 'Address', type: 'text', placeholder: "Enter address...", required: true },
    { name: 'householdCode', label: 'Household Code', type: 'text', placeholder: "Enter household code...", required: true },
  ];
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('id');
      setUserId(storedUserId);
    };
    getUserId();
  }, []);

  const handleCreate = async ({ householdName, address, householdCode }) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const householdData = {
        householdName,
        address,
        householdCode,
        members: [userId],
        weeklyLimit: null,
        monthlyLimit: null,
      };

      const res = await fetch('http://192.168.1.108:8000/households', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(householdData),
      });
      const json = await res.json();

      if (json.message === 'Household created.' && json.householdId) {
        Alert.alert(json.message);
        await AsyncStorage.setItem('householdId',json.householdId);
        const result = await fetch(`http://192.168.1.108:8000/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ householdId: json.householdId }),
        });

        const jsonResult = await result.json();

        if (jsonResult.message === 'Household attached to user.') {
          Alert.alert(jsonResult.message);
          navigation.navigate('Admin Home');
        } else {
          Alert.alert(jsonResult.error || 'Failed to attach household to user.');
        }
      } else {
        Alert.alert(json.error || 'Failed to create household.');
      }
    } catch (error) {
      Alert.alert('Creating household failed!', error.message);
    }
  };

  return (
    <PageLayout navigation={navigation}>
      <View style={styles.container}>
        <CustomForm
          title="Create household"
          registerQuestion={false}
          fields={fields}
          buttonText={"Create"}
          buttonIcon={"add"} 
          onSubmit={handleCreate}
        />
      </View>
    </PageLayout>
  );
};

export default CreateHousehold;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
    padding:30
  },
});
