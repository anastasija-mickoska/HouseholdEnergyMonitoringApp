import { StyleSheet, View, Alert } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';

const JoinHousehold = ({navigation}) => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'text', placeholder: "Enter household name...", required: true },
    { name: 'householdCode', label: 'Household Code', type: 'text', placeholder: "Enter household code...", required: true },
  ];

  const handleJoin = () => {
        //creating/joining a household logic here
      Alert.alert('Joined household!');
      navigation.navigate('Home');
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
