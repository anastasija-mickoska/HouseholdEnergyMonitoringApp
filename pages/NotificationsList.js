import PageLayout from "../components/PageLayout";
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import Notification from '../components/Notification';
import { useEffect, useState } from "react";
import { auth } from '../firebase';

const NotificationsList = ({navigation}) => {
    const [householdId, setHouseholdId] = useState(null);
    const [notifications, setNotifications] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const getToken = async() => {
            const fetchedToken = await auth.currentUser.getIdToken();
            setToken(fetchedToken);
        }
        getToken();
        const getHouseholdId = async () => {
        const storedHouseholdId = await AsyncStorage.getItem('householdId');
        setHouseholdId(storedHouseholdId);
        };
        getHouseholdId();
        const fetchNotifications = async() => {
            const res = await fetch(`http://192.168.1.108:8000/notifications/${householdId}`, {
                method:'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const results = await res.json();
            console.log(results);
            setNotifications(results);
        }
        fetchNotifications();
    }, []);

    if(!notifications) {
        return (
            <PageLayout navigation={navigation}>
                <View style={styles.container}>
                    <Text style={styles.title}>Notifications</Text>   
                    <Text style={styles.text}>No notifications available.</Text>       
                </View>
            </PageLayout>            
        )
    }
    return(
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <Text style={styles.title}>Notifications</Text>
                <ScrollView contentContainerStyle={styles.notifications}>
                {
                    notifications.map((item, index) => (
                        <Notification key={item.id} notification = {item.notification} date = {item.date}/>
                    ))
                }
                </ScrollView>            
            </View>
        </PageLayout>
    );
}

export default NotificationsList;

const styles = StyleSheet.create({
    container: {
        flex:1,
        padding:20,
        gap:20
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    },
    notifications:{
        gap:10,
        justifyContent:'center',
        alignItems:'center'
    },
    text: {
        color: '#1F2F98',
        fontSize: 20,
        fontFamily: 'Roboto Flex',
        fontWeight: '500',
        alignItems:'center',
        marginTop:30
    },
});