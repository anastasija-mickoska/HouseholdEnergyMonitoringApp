import { StyleSheet, View } from 'react-native';
import CustomForm from './components/CustomForm'; 
import PageLayout from '../components/PageLayout.js';

const ElectricityMeterUsage = ({navigation}) => {
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
      <View style={styles.container}>
        <CustomForm
          title="Electricity Meter Data"
          registerQuestion={false}
          fields={fields}
          buttonText={"Submit"}
          buttonIcon={'../assets/images/check.png'} 
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

