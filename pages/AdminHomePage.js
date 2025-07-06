import {View, Text,StyleSheet} from 'react-native';
import PageLayout from '../components/PageLayout';
import WeeklyMonthlyInsight from '../components/WeeklyMonthlyInsight';

const AdminHomePage = ({navigation, householdName}) => {
    return(
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.welcomeText}>Hi, *NAME OF THE USER*!</Text>
                <View style={styles.household}>
                    <Text style={styles.householdName}>HOUSEHOLD NAME</Text> 
                </View>
                <UsageComponent week={50} month={150}/>
                <WeeklyMonthlyInsight title={'Electricity cost'} texts={['This week', 'This month']} values={[1240,4520]}/>
                <CustomButton text={'View Insights'} imgSource={'../assets/images/bar_chart.png'}/>
                <WeeklyMonthlyInsight title={'Usage Limits'} texts={['Weekly limit', 'Monthly limit']} values={[60,200]}/>
                <CustomButton text={'Manage Usage Limits'} imgSource={'../assets/images/edit.png'}/>
                <CustomButton text={'Add Energy Usage'} imgSource={'../assets/images/add.png'}/>
            </View>
        </PageLayout>
    );
}

export default AdminHomePage;

const styles=StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-around',
        alignItems:'flex-end'
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