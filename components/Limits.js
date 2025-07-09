import {View, Text, Image,StyleSheet} from 'react-native';

const Limits = ({week, month}) => {
    return (
        <View style={styles.container}>
            <View style={styles.limit}>
                <Image source={require('../assets/images/lightbulb.png')} style={styles.icon}/>
                <View style={styles.text}>
                    <Text style={styles.textLimit}>Weekly limit</Text>
                    <Text style={styles.limitNumber}>{week} KWh</Text>
                </View>
            </View>
            <View style={styles.limit}>
                <Image source={require('../assets/images/lightbulb.png')} style={styles.icon}/>
                <View style={styles.text}>
                    <Text style={styles.textLimit}>Monthly limit</Text>
                    <Text style={styles.limitNumber}>{month} KWh</Text>
                </View>
            </View>
        </View>
    );
}

export default Limits;

const styles = StyleSheet.create({
    container: {
        width:'100%',
        height:70,
        backgroundColor: '#1F2F98',
        borderRadius: 20,
        padding:20,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    limit:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    textLimit: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: '600',
        letterSpacing: 0.6
    },    
    limitNumber: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: '600',
        letterSpacing: 0.8
    },
    icon: {
        width:30,
        height:30,
        marginRight:10
    }
});