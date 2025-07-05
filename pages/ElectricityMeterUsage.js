import { StyleSheet, View } from 'react-native';
import CustomForm from './components/CustomForm'; 
import SubmitIcon from '../assets/images/check.png'; 
import PageLayout from '../components/PageLayout.js';

const ElectricityMeterUsage = () => {
    const fields = [
        { name: 'highTariff', label: 'High tariff consumption (KWh)', type: 'number', placeholder: "Enter high tariff consumption (KWh)...", required: true },
        { name: 'lowTariff', label: 'Low tariff consumption (KWh)', type: 'number', placeholder: "Enter low tariff consumption (KWh)...", required: true },
        { name: 'electricityMeterSubmitDate', label: 'Date', type: 'date', placeholder: "Select date...", required: true },
    ];

    const handleSubmit = (event) => {
        text = "Energy usage successfully added.\n Total KWh consumption: \n Total electricity cost: \n"
        Alert.alert(text);
    }

  return (
    <PageLayout navigation={navigation}>
      <View styles={styles.container}>
        <CustomForm
          title="Electricity Meter Data"
          registerQuestion={false}
          fields={fields}
          buttonText="Submit"
          buttonIcon={<SubmitIcon width={25} height={25} />} 
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
  },
});

