import { StyleSheet, View, Alert } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const JoinHousehold = ({navigation}) => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'text', placeholder: "Enter household name...", required: true },
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

  const handleJoin = async ({ householdName, householdCode }) => {
      try {
        const token = await auth.currentUser.getIdToken();
        const householdData = {
          userId,
          householdCode,
        };
        const res = await fetch(`http://192.168.1.108:8000/households/${encodeURIComponent(householdName)}`, {
          method:'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(householdData)
        });
        if (!res.ok) {
          const errJson = await res.json();
          Alert.alert('Error', errJson.error || 'Unknown error');
          return;
        }
        const json = await res.json();
        Alert.alert(json.message);
        await AsyncStorage.setItem('householdId',json.householdId);
        navigation.navigate('User Home');
      }
      catch(error){
        console.error(error.message);
        Alert.alert('Joining household failed!', error.message);
      }
  };
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
