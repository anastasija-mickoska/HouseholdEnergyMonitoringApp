import { Alert,StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomForm from '../components/CustomForm'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {auth, db} from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { useState } from 'react';

const Register = ({navigation}) => {
  const fields = [
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter email...', required: true},
    { name: 'name', label: "Name", type: 'text', placeholder:'Enter name...',required: true},
    { name: 'password', label: 'Password', type: 'password', placeholder:'Enter password...', required: true},
    { name: 'role', label:'Role', type: 'text', placeholder:'Enter role - Admin/User...', required: true}
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRegister = async ({ email, name, password, role }) => {
    if(role != 'Admin' && role != 'User') {
        Alert.alert('Invalid role entered.', 'Valid roles: Admin and User');
    }
    try {
      setIsSubmitting(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let fcmToken = null;
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          fcmToken = await messaging().getToken();
        }
      } catch (error) {
        console.warn('FCM permission/token error:', error);
      }
      try {
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          role: role,
          householdId: null,
          fcmToken: fcmToken
        });
        setIsSubmitting(false);
        navigation.navigate('Login');
      }
      catch(err) {
        await user.delete();
        throw new Error('Error registering user!');
      }

    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Registration failed", error.message);
      console.error(error.message);
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
        buttonText={isSubmitting ? "Registering..." : "Register"}
        buttonIcon={"login"} 
        onSubmit={handleRegister}
        isSubmitting={isSubmitting}
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
