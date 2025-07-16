import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useState } from 'react';

const ApplianceUsageInsight = ({title,applianceUsage, usagesByAppliance, totalCost}) => {
    const [activePeriod, setActivePeriod] = useState('weekly');

    const handlePressWeekly = () => {
        setActivePeriod('weekly');
    }
    const handlePressMonthly = () => {
        setActivePeriod('monthly');
    }

    return(
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.charts}>
                <Text>Donut chart</Text>
                <Text>Pie chart</Text>
            </View>
            <View style={styles.text}>
                <Text style={styles.insights}>Usages by Appliance</Text>
                <Text style={styles.insights}>Total cost: {totalCost} den</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={activePeriod === 'weekly' ? styles.active : styles.button} onPress={handlePressWeekly}>
                    <Text style={activePeriod === 'weekly' ? styles.activeText : styles.buttonText}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={activePeriod === 'monthly' ? styles.active : styles.button} onPress={handlePressMonthly}>
                    <Text style={activePeriod === 'monthly' ? styles.activeText : styles.buttonText}>Monthly</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ApplianceUsageInsight;

const styles = StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        gap:20,
        backgroundColor: 'rgba(26, 167, 236, 0.10)',
        borderRadius:20,
        padding:30,
        width:'100%'
    },
    title: {
        color: '#1F2F98',
        fontSize: 24,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.2
    },
    charts: {
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center'
    },
    text: {
        backgroundColor: '#4ADEDE',
        borderRadius: 20,
        padding:10,
        alignItems:'center'
    },
    insights: {
        color: '#F3F3F3',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.6,
        alignItems:'center'
    },
    buttons: {
        justifyContent:'space-around',
        flexDirection:'row',
        alignItems:'center',
        gap:30
    },
    button: {
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:20,
        paddingVertical:5
    },
    active: {
        borderRadius: 20,
        backgroundColor:'#1AA7EC',
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:20,
        paddingVertical:5
    },
    buttonText: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.5,
    },
    activeText: {
        color: '#F3F3F3',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.5,    
    }

})