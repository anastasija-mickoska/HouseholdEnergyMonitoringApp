import { StyleSheet, View } from 'react-native';
import CustomForm from './components/CustomForm'; 
import CreateIcon from '../assets/images/add.png'; 
import PageLayout from '../components/PageLayout.js';

const CreateHousehold = () => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'text', placeholder: "Enter household name...", required: true },
    { name: 'address', label: 'Address', type: 'text', placeholder: "Enter address...", required: true },
    { name: 'householdCode', label: 'Household Code', type: 'text', placeholder: "Enter household code...", required: true },
  ];

  return (
    <PageLayout navigation={navigation}>
      <View styles={styles.container}>
        <CustomForm
          title="Create household"
          registerQuestion={false}
          fields={fields}
          buttonText="Create"
          buttonIcon={<CreateIcon width={25} height={25} />} 
        />
      </View>
    </PageLayout>
  );
};

export default CreateHousehold;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
