import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from './components/CustomForm'; 
import RegisterIcon from '../assets/images/login.svg'; 

const Register = () => {
  const fields = [
    { name: 'email', label: 'Email', type: 'email', required: true},
    { name: 'name', label: "Name", type: 'text', required: true},
    { name: 'password', label: 'Password', type: 'password', required: true}
  ];

  return (
    <LinearGradient
      colors={['#F3F3F3', 'rgba(28, 167, 236, 0.8)']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <CustomForm
        title="Create an account"
        registerQuestion={false}
        fields={fields}
        buttonText="Register"
        buttonIcon={<RegisterIcon width={25} height={25} />} 
      />
    </LinearGradient>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
