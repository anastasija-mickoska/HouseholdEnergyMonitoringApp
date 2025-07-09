import { Alert, StyleSheet, View } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';

const ApplianceEnergyUsage = ({navigation}) => {
    const fields = [
        { name: 'appliance', label: 'Appliance', type: 'picker', placeholder: "Select appliance from below:", required: true },
        { name: 'timeDuration', label: 'Time (hours)', type: 'number', placeholder: "Time (hours)", required: true },
        { name: 'date', label: 'Date', type: 'date', placeholder: "Date:", required: true },
        { name: 'startingTime', label: 'Date', type: 'time', placeholder: "Starting time:", required: true },
    ];

    const handleSubmit = (event) => {
        //modal
        Alert.alert('Energy usage successfully added.Total KWh consumption:Total electricity cost:');
        navigation.navigate('Home');
    }
    
    return (
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
            <CustomForm
                title="Appliance Energy Usage Data"
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

export default ApplianceEnergyUsage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:30,
    width:'100%'
  },
});


