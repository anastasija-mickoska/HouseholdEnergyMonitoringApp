import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PageLayout from '../components/PageLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  {useState, useEffect} from 'react';
import {auth} from '../firebase';

const WelcomePage = ({ navigation }) => {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      const storedId = await AsyncStorage.getItem('id');
      const fetchedToken = await auth.currentUser.getIdToken();
      setRole(storedRole);
      setUserId(storedId);
      setToken(fetchedToken);
    };
    loadData();
  }, []);

  useEffect(() => {
      if (userId && token) {
          fetchUserName();
      }
  }, [userId, token]);

  const fetchUserName = async() => {
      try {
          const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/users/${userId}`, {
              method:'GET',
              headers: {
                  'Authorization':`Bearer ${token}`
              }
          });
          const json = await res.json();
          if(json.error) {
              Alert.alert(json.error);
          }
          else{
              setUserName(json.name);
          }
      }
      catch(error) {
          console.error(error);
      }
  };

  const handlePress = () => {
    if(role === 'Admin') {
      navigation.navigate('Create Household');
    }
    else if(role === 'User') {
      navigation.navigate('Join Household'); 
    }
  };

  return (
    <PageLayout navigation={navigation}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome, {userName}!</Text>

        <View style={styles.view}>
          <Text style={styles.viewText}>
            You are not part of a household yet.
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <LinearGradient
            colors={['#4ADEDE', '#1AA7EC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{role === 'Admin' ? "Create Household" : "Join Household"}</Text>
            <Image source={require('../assets/images/add.png')} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </PageLayout>
  );
};

export default WelcomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding:30,
    gap:30
  },
  welcome: {
    color: '#1F2F98',
    fontSize: 32,
    fontFamily: 'Roboto Flex',
    fontWeight: '700',
    letterSpacing: 3.2,
    marginBottom: 20,
    wordWrap:'break-word'
  },
  view: {
    width: '100%',
    height: 80,
    backgroundColor: '#4ADEDE',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems:'center',
    marginBottom: 20
  },
  viewText: {
    color: '#F3F3F3',
    fontSize: 16,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    padding: 20
  },
  button: {
    width: '80%',
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  buttonText: {
    color: '#F3F3F3',
    fontSize: 12,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    padding: 10
  }
});
