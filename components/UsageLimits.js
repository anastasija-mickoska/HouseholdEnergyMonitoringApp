import { TouchableOpacity, StyleSheet, Text, Image, View, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const UsageLimits = ({weeklyLimit, monthlyLimit, handleSave}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Change weekly limit here:</Text>
            <TextInput style={styles.input} value={weeklyLimit} keyboardType="numeric"/>
            <Text style={styles.label}>Change monthly limit here:</Text>
            <TextInput style={styles.input} value={monthlyLimit} keyboardType="numeric"/>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <LinearGradient
                    colors={['#4ADEDE', '#1AA7EC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonStyle}>
                    <Text style={styles.buttonText}>Save</Text>
                    <Image source={require('../assets/images/add.png')}/>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

export default UsageLimits;


const styles = StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-around',
        alignItems:'center',
        width:'100%'
    },
    label: {
        color: '#1F2F98',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: '500',
        letterSpacing: 0.60,
        marginVertical:10
    },
    input: {
        width: '80%',
        height: 40,
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.20)',
        textAlign:'center',
        marginVertical:10,
        color: 'rgba(0, 0, 0, 0.50)'
    },
    button: {
        width: '30%',
        height: 40,
        marginTop:20
    },
    buttonStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
        borderRadius:20
    },
    icon: {
      height:25,
      width:25
    },
    buttonText: {
        color: '#F3F3F3',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: '500',
        padding:10
    }
});