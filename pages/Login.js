import { Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from '../components/CustomForm'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../backend/config/firebaseConfig';

const Login = ({navigation}) => {
  const fields = [
    { name: 'email', label:'Email', type: 'email', placeholder: "Enter email...", required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: "Enter password...", required: true },
  ];

  const handleLogin = async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(); 
      const userDocRef = doc(db,"users",user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("User data not found in Firestore.");
      }
      const { role, name, householdId } = userDocSnap.data();
      await AsyncStorage.multiSet([
        ['role', role],
        ['name', name],
        ['email', email],
        ['token', token],
        ['householdId', (householdId != null ? householdId : '')],
        ['id', user.uid]
      ]);
      Alert.alert('Logged in as:', user.email);
      if(householdId === null) {
        navigation.navigate('Welcome');
      }
      else {
        navigation.navigate('Home');
      }
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };


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
