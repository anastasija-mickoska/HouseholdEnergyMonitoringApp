import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from './components/CustomForm'; 
import LoginIcon from '../assets/images/login.png'; 

const Login = () => {
  const fields = [
    { name: 'householdName', label: 'Household Name', type: 'email', placeholder: "Enter email...", required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: "Enter password...", required: true },
  ];

  return (
    <LinearGradient
      colors={['#F3F3F3', 'rgba(28, 167, 236, 0.8)']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <CustomForm
        title="Login"
        registerQuestion={true}
        fields={fields}
        buttonText="Login"
        buttonIcon={<LoginIcon width={25} height={25} />} 
      />
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
