import { StyleSheet, View } from 'react-native';
import CustomForm from './components/CustomForm'; 
import JoinIcon from '../assets/images/add.png'; 
import PageLayout from '../components/PageLayout.js';

const JoinHousehold = () => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'text', placeholder: "Enter household name...", required: true },
    { name: 'householdCode', label: 'Household Code', type: 'text', placeholder: "Enter household code...", required: true },
  ];

  return (
    <PageLayout navigation={navigation}>
      <View styles={styles.container}>
        <CustomForm
          title="Join household"
          registerQuestion={false}
          fields={fields}
          buttonText="Join"
          buttonIcon={<JoinIcon width={25} height={25} />} 
        />
      </View>
    </PageLayout>
  );
};

export default JoinHousehold;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
