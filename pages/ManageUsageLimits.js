import PageLayout from "../components/PageLayout";
import WeeklyMonthlyInsight from "../components/WeeklyMonthlyInsight";
import UsageLimits from '../components/UsageLimits';
import { Alert, StyleSheet, Text, View, ScrollView } from "react-native";

const ManageUsageLimits = ({navigation}) => {

    const saveLimits = () => {
        Alert.alert('Handling save button...');
        navigation.navigate('Home');
    }

    return(
        <PageLayout navigation={navigation}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Manage Usage Limits</Text>
                <WeeklyMonthlyInsight texts={['Weekly limit', 'Monthly limit']} values={[60,200]}/>
                <UsageLimits weeklyLimit={60} monthlyLimit={200} handleSave={saveLimits}/>
            </ScrollView>
        </PageLayout> 
    );
}

export default ManageUsageLimits;

const styles=StyleSheet.create({
    container: {
        flexGrow:1,
        padding:20,
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        gap:20
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    }
});