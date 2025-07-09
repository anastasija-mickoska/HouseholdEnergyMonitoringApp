import { Alert,StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from '../components/CustomForm'; 

const Register = ({navigation}) => {
  const fields = [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email...', required: true},
    { name: 'name', label: "Name", type: 'text', placeholder:'Enter name...',required: true},
    { name: 'password', label: 'Password', type: 'password', placeholder:'Enter password...', required: true}
  ];

  const handleRegister = () => {
    Alert.alert('Registered!');
    navigation.navigate('Login');
  }

  return (
    <LinearGradient
      colors={['rgba(28, 167, 236, 0.8)','#F3F3F3']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <CustomForm
        title="Create an account"
        registerQuestion={false}
        fields={fields}
        buttonText="Register"
        buttonIcon={"login"} 
        onSubmit={handleRegister}
      />
    </LinearGradient>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:30
  },
});
