import { Alert, StyleSheet, View } from 'react-native';
import CustomForm from './components/CustomForm'; 
import SubmitIcon from '../assets/images/check.png'; 
import PageLayout from '../components/PageLayout.js';

const ApplianceEnergyUsage = () => {
    const fields = [
        { name: 'appliance', label: 'Appliance', type: 'picker', placeholder: "Select appliance from below:", required: true },
        { name: 'timeDuration', label: 'Time (hours)', type: 'number', placeholder: "Time (hours)", required: true },
        { name: 'startingTime', label: 'Date', type: 'time', placeholder: "Starting time:", required: true },
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

export default ApplianceEnergyUsage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


