import {View, Text,StyleSheet, ScrollView} from 'react-native';
import PageLayout from '../components/PageLayout';
import WeeklyMonthlyInsight from '../components/WeeklyMonthlyInsight';
import Limits from '../components/Limits';
import UsageComponent from '../components/UsageComponent';
import CustomButton from '../components/CustomButton';

const UserHomePage = ({navigation, householdName}) => {

    const handleAddButton = () => {
        navigation.navigate('Add Usage');
    }

    const handleInsightsButton = () => {
        navigation.navigate('Insights');
    }

    return(
        <PageLayout navigation={navigation}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.welcomeText}>Hi, *NAME OF THE USER*!</Text>
                <View style={styles.mainContent}>
                    <View style={styles.household}>
                        <Text style={styles.householdName}>HOUSEHOLD NAME</Text> 
                    </View>
                    <UsageComponent week={50} month={150}/>
                    <Limits week={60} month={200}/>
                    <WeeklyMonthlyInsight title={'Your Usage'} texts={['This Week', 'This Month']} values={[15,85]}/>
                    <CustomButton text={'View Insights'} imgSource={"insights"} onPress={handleInsightsButton}/>
                    <WeeklyMonthlyInsight title={'Electricity cost'} texts={['This week', 'This month']} values={[1240,4520]}/>
                    <CustomButton text={'Add Energy Usage'} imgSource={"add"} onPress={handleAddButton}/>
                </View>
            </ScrollView>
        </PageLayout>
    );
}

export default UserHomePage;

const styles=StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start', 
        gap: 10,
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    },
    welcomeText: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: '400',
        letterSpacing: 0.8
    },
    mainContent: {
        justifyContent:'center',
        alignItems:'center',
        gap:20,
        marginTop:30
    },
    household: {
        justifyContent:'center',
        alignItems:'center',
        padding:10,
        width: '70%',
        borderRadius: 20,
        backgroundColor:'#4ADEDE'
    },
    householdName: {
        color: '#F3F3F3',
        fontSize: 20,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
    }
});