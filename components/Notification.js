import { StyleSheet, Text,View, Image } from "react-native";

const Notification = ({notification, date}) => {
    return(
        <View style={styles.container}>
            <Image source={require('../assets/images/alert_icon.png')} style={styles.alert}/>
            <Text style={styles.notification}>{notification}</Text>
            <Text style={styles.date}>{date}</Text>
        </View>
    )
}

export default Notification;

const styles=StyleSheet.create({
    container: {
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding:10,
        height: 60, 
        width: '90%',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.20)',
        borderRadius: 20
    },
    alert: {
        width:25,
        height:25
    },
    notification: {
        color: '#1F2F98',
        fontSize: 12,
        fontFamily: 'Roboto Flex',
        fontWeight: '400',
        lineHeight: 20,
        letterSpacing: 0.6
    },
    date: {
        color: 'rgba(0, 0, 0, 0.50)',
        fontSize: 10,
        fontFamily: 'Roboto Flex',
        fontWeight: '400',
        letterSpacing: 0.5
    }
})