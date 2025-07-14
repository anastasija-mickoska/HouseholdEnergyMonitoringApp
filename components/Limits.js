import {View, Text, Image,StyleSheet} from 'react-native';

const Limits = ({week, month}) => {
    return (
        <View style={styles.container}>
            <View style={styles.limit}>
                <Image source={require('../assets/images/lightbulb.png')} style={styles.icon}/>
                <View style={styles.text}>
                    <Text style={styles.textLimit}>Weekly limit</Text>
                    <Text style={styles.limitNumber}>{week ?? 0} KWh</Text>
                </View>
            </View>
            <View style={styles.limit}>
                <Image source={require('../assets/images/lightbulb.png')} style={styles.icon}/>
                <View style={styles.text}>
                    <Text style={styles.textLimit}>Monthly limit</Text>
                    <Text style={styles.limitNumber}>{month ?? 0} KWh</Text>
                </View>
            </View>
        </View>
    );
};
export default Limits;

const styles = StyleSheet.create({
    container: {
        width:'100%',
        backgroundColor: '#1F2F98',
        borderRadius: 20,
        padding:10,
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center'
    },
    limit:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    textLimit: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: '600',
        letterSpacing: 0.6
    },    
    limitNumber: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 0.8
    },
    icon: {
        width:40,
        height:40,
        marginRight:10
    }
});