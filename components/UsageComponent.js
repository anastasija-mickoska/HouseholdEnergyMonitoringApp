import { View, Text, StyleSheet} from 'react-native';


const UsageComponent = ({week, month}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Usage</Text>
            <View style={styles.usage}>
                <View style={styles.weekMonth}>
                    <Text style={styles.text}>This week</Text>
                    <Text style={styles.number}>{week} KWh</Text>
                </View>
                <View style={styles.weekMonth}>
                    <Text style={styles.text}>This month</Text>
                    <Text style={styles.number}>{month} KWh</Text>
                </View>
            </View>
        </View>
    );
}

export default UsageComponent;

const styles=StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        width: '80%',
        height: 230,
        backgroundColor:' rgba(26, 167, 236, 0.10)',
        borderRadius: 20,
        padding:10
    },
    title: {
        color: '#1F2F98',
        fontSize: 24,
        fontFamily: 'Roboto Flex',
        fontWeight: '600',
        letterSpacing: 1.2
    },
    usage: {
        flexDirection: 'row',
        justifyContent:'space-between'
    },
    weekMonth: {
        width: 140,
        height: 140,
        backgroundColor: '#1CA7EC',
        borderRadius: 20,
    },
    text: {
        color: '#F3F3F3',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 0.8
    },
    number: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'Roboto Flex',
        fontWeight: '600',
        letterSpacing: 1.2
    }
});