import { TouchableOpacity, StyleSheet, Text, Image } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { LinearGradient } from "react-native-svg";

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
                    style={styles.button}>
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
        flex:1
    },
    label: {
        color: '#1F2F98',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: '500',
        letterSpacing: 0.60
    },
    input: {
        width: '80%',
        height: 40,
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.20)'
    },
        button: {
        width: '30%',
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row'
    },
    buttonText: {
        color: '#F3F3F3',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: '500',
        padding:10
    }
});