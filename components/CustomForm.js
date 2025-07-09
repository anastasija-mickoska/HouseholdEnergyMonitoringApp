import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform, Alert } from "react-native";
import { useState } from "react";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from "@react-navigation/native";

const buttonImgMap = {
  check:require('../assets/images/check.png'),
  add:require('../assets/images/add.png'),
  login:require('../assets/images/login.png'),
}

const CustomForm = ({title, registerQuestion, fields, buttonText, buttonIcon, onSubmit}) => {
    const [formData, setFormData] = useState({});
    const [showDatePickers, setShowDatePickers] = useState({});
    const navigation = useNavigation();

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, event, selectedDate) => {
        if (selectedDate) {
        handleChange(name, selectedDate.toISOString().split('T')[0]); 
        }
        setShowDatePickers(prev => ({ ...prev, [name]: false }));
    };

    const handleSubmit = () => {
        for (let field of fields) {
          if (field.required && !formData[field.name]) {
            Alert.alert("Missing field", `${field.label} is required.`);
            return;
          }
        }
        onSubmit(formData); 
    };

    const renderInputField = (field) => {
      switch (field.type) {
        case 'picker':
          return (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData[field.name] || field.options?.[0]?.value}
                onValueChange={(value) => handleChange(field.name, value)}
              >
                {field.options?.map((option, index) => (
                  <Picker.Item key={index} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>
          );
        case 'date':
          return (
            <View>
              <TouchableOpacity
                onPress={() => setShowDatePickers(prev => ({ ...prev, [field.name]: true }))}
                style={styles.input}
              >
                <Text style={{color:'rgba(0,0,0,0.40)'}}>{formData[field.name] || 'Select a date...'}</Text>
              </TouchableOpacity>

              {showDatePickers[field.name] && (
                <DateTimePicker
                  value={formData[field.name] ? new Date(formData[field.name]) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      handleDateChange(field.name, event, selectedDate);
                    } else {
                      setShowDatePickers(prev => ({ ...prev, [field.name]: false }));
                    }
                  }}
                />
              )}
            </View>
          );
          case 'time':
            return (
              <View>
                <TouchableOpacity
                  onPress={() => setShowDatePickers(prev => ({ ...prev, [field.name]: true }))}
                  style={styles.input}
                >
                  <Text style={{color:'rgba(0,0,0,0.40)'}}>
                    {formData[field.name]
                      ? new Date(formData[field.name]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Select a time...'}
                  </Text>
                </TouchableOpacity>

                {showDatePickers[field.name] && (
                  <DateTimePicker
                    value={formData[field.name] ? new Date(formData[field.name]) : new Date()}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        handleDateChange(field.name, event, selectedTime);
                      } else {
                        setShowDatePickers(prev => ({ ...prev, [field.name]: false }));
                      }
                    }}
                  />
                )}
              </View>
            );
            default:
            return (
                <TextInput
                value={formData[field.name] || ''}
                onChangeText={(text) => handleChange(field.name, text)}
                placeholder={field.placeholder || ''}
                secureTextEntry={field.type === 'password'}
                keyboardType={
                    field.type === 'email'
                    ? 'email-address'
                    : field.type === 'number'
                    ? 'numeric'
                    : 'default'
                }
                style={styles.input}
                />
            );
        }
    };
    return (
        <View style={styles.container}>
            <Text style={[styles.title, (title === 'Login' || title === 'Create an account') && styles.loginRegisterTitle]}>
            {title}
            </Text>
            {
                registerQuestion ?  
                <TouchableOpacity onPress={()=> {navigation.navigate('Register')}}>
                  <Text style={styles.registerQuestion}>
                    Don't have an account? <Text style={styles.span}>Register now!</Text>
                  </Text>   
                </TouchableOpacity>             
                : null
            }
            <View style={styles.form}>
                {fields.map((field, index) => (
                <View key={index} style={styles.formGroup}>
                    {renderInputField(field)}
                </View>
                ))}
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>{buttonText}</Text>
                    <Image source={buttonImgMap[buttonIcon]}/>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default CustomForm;

const styles = StyleSheet.create({
  container: {
    flexDirection:'column',
    gap:20,
    width:'100%'
  },
  title: {
    color: '#1F2F98',
    fontSize: 32,
    fontFamily: 'Roboto Flex',
    fontWeight: '700',
  },
  loginRegisterTitle: {
    color: '#F3F3F3',
  },
  registerQuestion: {
    color: '#F3F3F3',
    fontSize: 12,
    fontFamily: 'Roboto Flex',
    fontWeight: '600',
  },
  span: {
    color: '#1F2F98',
    fontSize: 12,
    fontFamily: 'Roboto Flex',
    fontWeight: '600',
  },
  form: {
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems:'center',
    marginVertical:10,
    width:'100%',
  },
  formGroup: {
    width:'100%',
    paddingVertical:20
  },
  button: {
    width: '60%',
    height: 40,
    backgroundColor: '#1AA7EC',
    borderRadius: 20,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    marginVertical:20
  },
  buttonText: {
    color: '#F3F3F3',
    fontSize: 12,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.20)',
    padding:10,
  },
  pickerContainer: {
    backgroundColor: '#F3F3F3',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    height:40
  },

});