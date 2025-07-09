import { Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from '../components/CustomForm'; 

const Login = ({navigation}) => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'email', placeholder: "Enter email...", required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: "Enter password...", required: true },
  ];

  const handleLogin = () => {
    Alert.alert('Logged in!');
    navigation.navigate('Welcome');
  }

  return (
    <LinearGradient
      colors={['rgba(28, 167, 236, 0.8)', '#F3F3F3']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <CustomForm
        title="Login"
        registerQuestion={true}
        fields={fields}
        buttonText="Login"
        buttonIcon={"login"} 
        onSubmit={handleLogin}
      />
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    padding:30
  },
});
