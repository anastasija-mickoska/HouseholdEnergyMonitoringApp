import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useState } from 'react';

const ElectricityMeterInsight = ({lowTariff, highTariff, totalCost}) => {
    const [isActiveWeekly, setIsActiveWeekly] = useState(true);
    const [isActiveMonthly, setIsActiveMonthly] = useState(false);

    const handlePress = () => {
        //handle switching from weekly to monthly
    }

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Electricity Meter Data</Text>
            <View style={styles.charts}>
                <Text>Donut chart</Text>
                <Text>Bar chart</Text>
            </View>
            <View style={styles.text}>
                <Text style={styles.insights}>Low tariff consumption:{lowTariff} KWh</Text>
                <Text style={styles.insights}>High tariff consumption:{highTariff} KWh</Text>
                <Text style={styles.insights}>Total cost:{totalCost} den</Text>
            </View>
            <View style={styles.buttons}>
                <TouchableOpacity style={isActiveWeekly ? styles.active : styles.button} onPress={handlePress}>
                    <Text style={isActiveWeekly ? styles.activeText : styles.buttonText}>Weekly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={isActiveMonthly ? styles.active : styles.button} onPress={handlePress}>
                    <Text style={isActiveMonthly ? styles.activeText : styles.buttonText}>Monthly</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ElectricityMeterInsight;

const styles = StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        gap:10,
        backgroundColor: 'rgba(26, 167, 236, 0.10)',
        borderRadius:20,
        padding:20
    },
    title: {
        color: '#1F2F98',
        fontSize: 24,
        fontFamily: 'Roboto Flex',
        fontWeight: '600',
        letterSpacing: 1.2
    },
    charts: {
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center'
    },
    text: {
        width: '70%',
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
        width:'70%',
        justifyContent:'space-between',
        flexDirection:'row',
        alignItems:'center'
    },
    button: {
        width: '40%',
        height: 20,
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        alignItems:'center',
        justifyContent:'center'
    },
    active: {
        width: '40%',
        height: 20,
        borderRadius: 20,
        backgroundColor:'#1AA7EC',
        alignItems:'center',
        justifyContent:'center'
    },
    buttonText: {
        color: '#1F2F98',
        fontSize: 10,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.5,
    },
    activeText: {
        color: '#F3F3F3',
        fontSize: 10,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        letterSpacing: 0.5,    
    }

})