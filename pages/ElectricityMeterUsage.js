import { StyleSheet, View, Alert } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';

const ElectricityMeterUsage = ({navigation}) => {
    const fields = [
        { name: 'highTariff', label: 'High tariff consumption (KWh)', type: 'number', placeholder: "Enter high tariff consumption (KWh)...", required: true },
        { name: 'lowTariff', label: 'Low tariff consumption (KWh)', type: 'number', placeholder: "Enter low tariff consumption (KWh)...", required: true },
        { name: 'electricityMeterSubmitDate', label: 'Date', type: 'date', placeholder: "Select date...", required: true },
    ];

    const handleSubmit = (event) => {
        //modal instead of built-in alert for styling purposes
        Alert.alert('Energy usage successfully added. Total KWh consumption: Total electricity cost: ');
        navigation.navigate('Home');
    }

  return (
    <PageLayout navigation={navigation}>
      <View style={styles.container}>
        <CustomForm
          title="Electricity Meter Data"
          registerQuestion={false}
          fields={fields}
          buttonText={"Submit"}
          buttonIcon={"check"} 
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
    width:'100%',
    padding:30
  },
});

