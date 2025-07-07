import ApplianceUsageInsight from "../components/ApplianceUsageInsight";
import ElectricityMeterInsight from "../components/ElectricityMeterInsight";
import PageLayout from "../components/PageLayout";
import {Text, StyleSheet, View} from 'react-native';

const usages = [];

const InsightsPage = ({navigation}) => {
    return(
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <Text style={styles.title}>Overview</Text>
                <ElectricityMeterInsight lowTariff={24} highTariff={26} totalCost={1500}/>
                {/*This should only appear for admin*/}
                <ApplianceUsageInsight title={'Appliance Usage Data'} applianceUsage={24} usagesByAppliance={usages} totalCost={540}/>
                <ApplianceUsageInsight title={'Your Appliance Usage'} applianceUsage={15} usagesByAppliance={usages} totalCost={300}/>
                <CustomButton text={'View Notifications'} imgSource={'../assets/images/notifications.png'} onPress={()=>{navigation.navigate('Notifications')}}/>
            </View>
        </PageLayout>
    );
}

export default InsightsPage;

const styles=StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-around',
        alignItems:'flex-start',
        gap:20
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    },
})