import { Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from '../components/CustomForm'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import messaging from '@react-native-firebase/messaging';

const Login = ({ navigation }) => {
  const fields = [
    { name: 'email', label:'Email', type: 'email', placeholder: "Enter email...", required: true },
    { name: 'password', label: 'Password', type: 'password', placeholder: "Enter password...", required: true },
  ];

  const handleLogin = async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let fcmToken = null;
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          fcmToken = await messaging().getToken();
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: fcmToken
          });
        } else {
          console.log('Notification permission denied');
        }
      } catch (msgError) {
        console.warn('FCM permission/token error:', msgError);
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("User data not found in Firestore.");
      }
      const { role, name, householdId } = userDocSnap.data();

      await AsyncStorage.multiSet([
        ['role', role],
        ['name', name],
        ['email', email],
        ['householdId', householdId ?? 'null'],
        ['id', user.uid],
        ['fcmToken', fcmToken ?? 'null'],
      ]);
      if (!householdId) {
        navigation.navigate('Welcome');
      } else {
        if (role === 'Admin') {
          navigation.navigate('Admin Home');
        } else if (role === 'User') {
          navigation.navigate('User Home');
        }
      }
    } catch (error) {
      Alert.alert("Login failed", error.message);
      console.error(error.message);
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
