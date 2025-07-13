import PageLayout from "../components/PageLayout";
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import Notification from '../components/Notification';
import { useEffect, useState } from "react";
import auth from '@react-native-firebase/auth';

const notificationsExample = [
    { id:1,text: "Some text", date:'08/07/2025'},
    { id:2,text: "Some text", date:'08/07/2025'},
    { id:3,text: "Some text", date:'08/07/2025'},
    { id:4,text: "Some text", date:'08/07/2025'},
    { id:5,text: "Some text", date:'08/07/2025'},
    { id:6,text: "Some text", date:'08/07/2025'},
    { id:7,text: "Some text", date:'08/07/2025'},
    { id:8,text: "Some text", date:'08/07/2025'},
    { id:9,text: "Some text", date:'08/07/2025'},
    { id:10,text: "Some text", date:'08/07/2025'},
];

const NotificationsList = ({navigation, notifications}) => {
    const [householdId, setHouseholdId] = useState(null);

    useEffect(() => {
        const getHouseholdId = async () => {
        const storedHouseholdId = await AsyncStorage.getItem('householdId');
        setHouseholdId(storedHouseholdId);
        };
        getHouseholdId();
    }, []);

    return(
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <Text style={styles.title}>Notifications</Text>
                <ScrollView contentContainerStyle={styles.notifications}>
                {
                    notificationsExample.map((item, index) => (
                        <Notification key={item.id} notification = {item.text} date = {item.date}/>
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
    }
});