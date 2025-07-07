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
        justifyContent:'space-around',
        alignItems:'center',
        padding:10,
        width: '100%',
        borderRadius: 20
    },
    text:{
      color: '#F3F3F3',
      fontSize: 16,
      fontFamily: 'Roboto Flex',
      fontWeight: 700,
      letterSpacing: 0.8,
    },
    value: {
      color: '#F3F3F3',
      fontSize: 24,
      fontFamily: 'Roboto Flex',
      fontWeight: 600,
      letterSpacing: 1.2,
    },
    blue: {
        backgroundColor:'#1CA7EC'
    },
    green: {
        backgroundColor: '#4ADEDE'
    }
})