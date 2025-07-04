import AddIcon from '../assets/images/add.svg';
import { LinearGradient } from 'expo-linear-gradient';

const WelcomePage = () => {

    const handlePress = () => {
        //navigate to other page
    }

    return(
        <View style={styles.container}>
            <Text style={styles.welcome}>Welcome, *NAME OF THE USER*!</Text>
            <View style={styles.view}>
                <Text styles={styles.viewText}>
                    You are not part of a household yet.
                </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={handlePress}>
                <LinearGradient
                    colors={['#4ADEDE', '#1AA7EC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Create/Join household</Text>
                    <Image source={require({AddIcon})}/>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

export default WelcomePage;

const styles=StyleSheet.create({
    container: {
        flex:1,
        justifyContent: 'center'
    },
    welcome: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: 600,
        letterSpacing: 3.20,
    },
    view: {
        width: '80%',
        height: 80,
        background: '#4ADEDE',
        borderRadius: 20,
        justifyContent: 'center'
    },
    viewText: {
        color: '#F3F3F3',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        padding:10
    }, 
    button: {
        width: '30%',
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row'
    },
    buttonText: {
        color: '#F3F3F3',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: 500,
        padding:10
    }
});