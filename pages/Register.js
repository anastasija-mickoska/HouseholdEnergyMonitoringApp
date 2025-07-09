import { Alert,StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from '../components/CustomForm'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth, db} from '../backend/config/firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';

const Register = ({navigation}) => {
  const fields = [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email...', required: true},
    { name: 'name', label: "Name", type: 'text', placeholder:'Enter name...',required: true},
    { name: 'password', label: 'Password', type: 'password', placeholder:'Enter password...', required: true},
    { name: 'role', label:'Role', type: 'text', placeholder:'Enter role - Admin/User...', required: true}
  ];

  const handleRegister = async ({ email, name, password, role }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db,"users", user.uid), {
        name:name,
        email:email,
        role:role,
        householdId:null
      });
      Alert.alert('Registered:', user.email);
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    }
  };

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
