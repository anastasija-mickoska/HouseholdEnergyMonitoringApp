import CustomButton from "../components/CustomButton";
import PageLayout from "../components/PageLayout";
import {View,Text, StyleSheet} from 'react-native';

const AddUsage = ({navigation}) => {
    return (
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <Text style={styles.add}>Add Energy Usage</Text>
                <Text style={styles.select}>Select way of entering energy usage:</Text>
                <CustomButton onPress={()=> {navigation.navigate('Electricity Meter Usage')}}
                    text={'Electricity meter'}/>
                <CustomButton onPress={()=> {navigation.navigate('Appliance Energy Usage')}}
                    text={'Appliance energy usage'}/>
            </View>
        </PageLayout>
    );
}

export default AddUsage;

const styles=StyleSheet.create({
    container: {
        flexDirection:'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap:30
    },
    add: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6,
    },
    select: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: '500'
    }
});