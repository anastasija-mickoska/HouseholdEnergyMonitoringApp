import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PageLayout from '../components/PageLayout.js';

const WelcomePage = ({ navigation }) => {
  const handlePress = () => {
    navigation.navigate('Create Household'); 
  };

  return (
    <PageLayout navigation={navigation}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome, *NAME OF THE USER*!</Text>

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
            <Text style={styles.buttonText}>Create/Join household</Text>
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
    alignItems: 'center' 
  },
  welcome: {
    color: '#1F2F98',
    fontSize: 32,
    fontFamily: 'Roboto Flex',
    fontWeight: '600',
    letterSpacing: 3.2,
    marginBottom: 20
  },
  view: {
    width: '80%',
    height: 80,
    backgroundColor: '#4ADEDE',
    borderRadius: 20,
    justifyContent: 'center',
    marginBottom: 20
  },
  viewText: {
    color: '#F3F3F3',
    fontSize: 16,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    padding: 10
  },
  button: {
    width: '60%',
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
