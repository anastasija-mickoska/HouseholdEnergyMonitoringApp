import { TouchableOpacity, StyleSheet, Text, Image, View, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";

const UsageLimits = ({ weeklyLimit, monthlyLimit, onSave }) => {
  const [localWeeklyLimit, setLocalWeeklyLimit] = useState(weeklyLimit?.toString() ?? '');
  const [localMonthlyLimit, setLocalMonthlyLimit] = useState(monthlyLimit?.toString() ?? '');

  useEffect(() => {
    setLocalWeeklyLimit(weeklyLimit?.toString() ?? '');
    setLocalMonthlyLimit(monthlyLimit?.toString() ?? '');
  }, [weeklyLimit, monthlyLimit]);

  const onSavePress = () => {
    const weeklyNum = parseFloat(localWeeklyLimit);
    const monthlyNum = parseFloat(localMonthlyLimit);
    if (isNaN(weeklyNum) || isNaN(monthlyNum)) {
      Alert.alert('Please enter valid numbers');
      return;
    }
    onSave({
        weeklyLimit: weeklyNum,
        monthlyLimit: monthlyNum
    });
  };

  return (
    <View style={styles.container}>
        <Text style={styles.label}>Change weekly limit here:</Text>
        <TextInput
            style={styles.input}
            value={localWeeklyLimit}
            onChangeText={setLocalWeeklyLimit}
            keyboardType="numeric"
        />
        <Text style={styles.label}>Change monthly limit here:</Text>
        <TextInput
            style={styles.input}
            value={localMonthlyLimit}
            onChangeText={setLocalMonthlyLimit}
            keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={onSavePress}>
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
};

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
