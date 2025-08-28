import PageLayout from "../components/PageLayout";
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import Notification from '../components/Notification';
import { useEffect, useState } from "react";
import { auth } from '../firebase';
import AsyncStorage from "@react-native-async-storage/async-storage";

const formatDate = (timestamp) => {
  if (!timestamp || !timestamp._seconds) return '';
  const date = new Date(timestamp._seconds * 1000);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const NotificationsList = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedToken = await auth.currentUser.getIdToken();
                const storedHouseholdId = await AsyncStorage.getItem('householdId');

                if (fetchedToken && storedHouseholdId) {
                    await fetchNotifications(fetchedToken, storedHouseholdId);
                }
            } catch (error) {
                console.error("Error loading token or householdId", error);
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchNotifications = async (token, householdId) => {
        try {
            const res = await fetch(`https://household-energy-backend.ey.r.appspot.com/notifications/${householdId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const results = await res.json();
            setNotifications(results);
        } catch (error) {
            console.error('Error fetching notifications', error);
        }
    };

    if(loading) {
        return(
            <PageLayout navigation={navigation}>
                <View style={styles.container}>
                    <Text style={styles.title}>Notifications</Text> 
                    <Text style={styles.text}>Loading notifications...</Text>   
                </View>
            </PageLayout>
        )
    }
    return (
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <Text style={styles.title}>Notifications</Text>
                {
                    notifications.length === 0 ? (
                        <Text style={styles.text}>No notifications available.</Text>
                    ) : (
                        <ScrollView contentContainerStyle={styles.notifications}>
                            {
                                notifications.map((item) => (
                                    <Notification key={item.id} notification={item.notification} date={formatDate(item.date)} />
                                ))
                            }
                        </ScrollView>
                    )
                }
            </View>
        </PageLayout>
    );
};

export default NotificationsList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 20
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.6
    },
    notifications: {
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: '#1F2F98',
        fontSize: 20,
        fontFamily: 'Roboto Flex',
        fontWeight: '500',
        alignItems: 'center',
        marginTop: 30
    },
});
