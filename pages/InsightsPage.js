import ApplianceUsageInsight from "../components/ApplianceUsageInsight";
import ElectricityMeterInsight from "../components/ElectricityMeterInsight";
import PageLayout from "../components/PageLayout";
import {Text, StyleSheet, View, ScrollView} from 'react-native';
import CustomButton from '../components/CustomButton';
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const InsightsPage = ({navigation}) => {
    const [role, setRole] = useState(null);

    useEffect(()=> {
        const loadData = async() => {
            const storedRole = await AsyncStorage.getItem('role');
            setRole(storedRole);
        }
        loadData();
    }, []);

    return(
        <PageLayout navigation={navigation}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Overview</Text>
                <View style={styles.mainContent}>
                    <ElectricityMeterInsight/>
                    { role == 'Admin' &&  
                        <ApplianceUsageInsight title={'Appliance Usage Data'}/> }
                    <ApplianceUsageInsight title={'Your Appliance Usage'}/>
                    <CustomButton text={'View Notifications'} imgSource={"notifications"} onPress={()=>{navigation.navigate('Notifications')}}/>
                </View>
            </ScrollView>
        </PageLayout>
    );
}

export default InsightsPage;

const styles=StyleSheet.create({
    container: {
        flexGrow:1,
        flexDirection:'column',
        justifyContent:'space-around',
        alignItems:'flex-start',
        gap:20,
        padding:20,
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    },
    mainContent: {
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        gap:20,
        width:'100%'
    }
})