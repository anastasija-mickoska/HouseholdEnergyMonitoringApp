import { StyleSheet, View, Alert} from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';

const CreateHousehold = ({navigation}) => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'text', placeholder: "Enter household name...", required: true },
    { name: 'address', label: 'Address', type: 'text', placeholder: "Enter address...", required: true },
    { name: 'householdCode', label: 'Household Code', type: 'text', placeholder: "Enter household code...", required: true },
  ];

  const handleCreate = () => {
        //creating/joining a household logic here
      Alert.alert('Created household!');
      navigation.navigate('Home');
  }

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
