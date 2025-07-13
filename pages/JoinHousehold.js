import { StyleSheet, View, Alert } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import { joinHousehold } from '../backend/firestoreService';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const JoinHousehold = ({navigation}) => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'text', placeholder: "Enter household name...", required: true },
    { name: 'householdCode', label: 'Household Code', type: 'text', placeholder: "Enter household code...", required: true },
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

  const handleJoin = async ({ householdName, householdCode }) => {
      try {
        const token = auth().currentUser.getIdToken();
        const householdData = {
          userId: userId,
          householdName: householdName, 
          householdCode: householdCode
        }
        const res = await fetch(`http://192.168.1.108:8000/households/${householdId}`, {
          method:'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(householdData)
        });
        const json = await res.json();
        if(json.message && json.message == 'User added to household.') {
          Alert.alert(json.message);
          navigation.navigate('Home');
        }
        else {
          Alert.alert(json.error);
        }
      }
      catch(error){
        Alert.alert('Creating household failed!', error.message);
      }
  }
  return (
    <PageLayout navigation={navigation}>
      <View style={styles.container}>
        <CustomForm
          title="Join household"
          registerQuestion={false}
          fields={fields}
          buttonText={"Join"}
          buttonIcon={"add"} 
          onSubmit={handleJoin}
        />
      </View>
    </PageLayout>
  );
};

export default JoinHousehold;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:'100%',
    padding:30,
    justifyContent:'center',
    alignItems:'center'
  },
});
