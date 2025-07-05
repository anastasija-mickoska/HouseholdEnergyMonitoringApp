import {Text,View,StyleSheet} from 'react-native';

const Insight = ({text, value, title}) => {
    return (
        <View style={[styles.container, title === 'Electricity Cost' ? styles.blue : styles.green]}>
            <Text style={styles.text}>{text}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

export default Insight;

const styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        padding:10,
        width: '70%',
        borderRadius: 20
    },
    blue: {
        backgroundColor:'#1CA7EC'
    },
    green: {
        backgroundColor: '#4ADEDE'
    }
})