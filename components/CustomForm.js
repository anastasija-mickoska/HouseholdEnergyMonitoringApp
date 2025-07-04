import { View, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";

const CustomForm = ({title, registerQuestion, fields, buttonText, buttonIcon, onSubmit}) => {
    const [formData, setFormData] = useState({});
    const [showDatePickers, setShowDatePickers] = useState({});

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, event, selectedDate) => {
        if (selectedDate) {
        handleChange(name, selectedDate.toISOString().split('T')[0]); 
        }
        setShowDatePickers(prev => ({ ...prev, [name]: false }));
    };

    const handleSubmit = (event) => {
        onSubmit(formData);
    };

    const renderInputField = (field) => {
        switch (field.type) {
            case 'picker':
            return (
                <Picker
                selectedValue={formData[field.name] || field.options?.[0]?.value}
                onValueChange={(value) => handleChange(field.name, value)}
                style={styles.input}
                >
                {field.options?.map((option, index) => (
                    <Picker.Item key={index} label={option.label} value={option.value} />
                ))}
                </Picker>
            );
            case 'date':
            return (
                <DateTimePicker
                value={formData[field.name] || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                    if (selectedDate) {
                    handleDateChange(field.name, event, selectedDate);
                    }
                }}
                style={styles.input}
                />
            );
            case 'time':
            return (
              <DateTimePicker
                value={formData[field.name] || new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    handleDateChange(field.name, event, selectedTime);
                  }
                }}
                style={styles.input}
              />
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
        <View>
            <Text style={[styles.title, (title === 'Login' || title === 'Create an account') && styles.loginRegisterTitle]}>
            {title}
            </Text>
            {
                registerQuestion ?  
                <Text style={styles.registerQuestion}>Don't have an account? <span style={styles.span}>Register now!</span></Text>
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
                    <Image source = {require({buttonIcon})}/>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default CustomForm;

const styles = StyleSheet.create({
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
    alignItems:'center'
  },
  formGroup: {
    padding:10
  },
  button: {
    width: '20%',
    height: 40,
    backgroundColor: '#1AA7EC',
    borderRadius: 20,
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
    borderColor: rgba(0, 0, 0, 0.20)
  }
});