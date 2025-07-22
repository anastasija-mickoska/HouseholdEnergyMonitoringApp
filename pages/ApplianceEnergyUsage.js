import { Alert, StyleSheet, View, Modal, Text } from 'react-native';
import CustomForm from '../components/CustomForm'; 
import PageLayout from '../components/PageLayout';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase';

const ApplianceEnergyUsage = ({ navigation }) => {
    const [householdId, setHouseholdId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState(null);
    const [appliances, setAppliances] = useState([]);
    const [token, setToken] = useState(null);
    const [totalKWh, setTotalKwh] = useState(null);
    const [totalCost, setTotalCost] = useState(null);
    const [modalVisibleAppliance, setModalVisibleAppliance] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const storedUserId = await AsyncStorage.getItem('id');
            const storedHouseholdId = await AsyncStorage.getItem('householdId');
            const storedRole = await AsyncStorage.getItem('role');
            const fetchedtoken = await auth.currentUser.getIdToken();
            setUserId(storedUserId);
            setHouseholdId(storedHouseholdId);
            setRole(storedRole);
            setToken(fetchedtoken);
            const res = await fetch('http://192.168.1.108:8000/appliances', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${fetchedtoken}`,
                }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch appliances.');
            }
            const json = await res.json();
            setAppliances(json.map(item => ({ label: item.applianceName, value: item.applianceName })));
        };
        loadData();
    }, []);


    const handleSubmit = async ({ appliance, timeDuration, date, startingTime }) => {
        try {
            const [hours, minutes] = startingTime.split(':').map(Number);
            const startingDateTime = new Date(date);
            startingDateTime.setHours(hours);
            startingDateTime.setMinutes(minutes);

            const usageData = {
                userId: userId,
                householdId: householdId,
                appliance: appliance,
                timeDuration: Number(timeDuration),
                date: new Date(date),
                startingTime: startingDateTime 
            };
            const res = await fetch('http://192.168.1.108:8000/applianceEnergyUsages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usageData)
            });

            if (!res.ok) {
                throw new Error('Failed to submit usage data.');
            }

            const json = await res.json();
            if (json.message === 'Appliance energy usage added.') {
                setTotalKwh(json.totalKWh);
                setTotalCost(json.totalCost);
                setModalVisibleAppliance(true);
                setTimeout(() => {
                    setModalVisibleAppliance(false);
                    if(role === 'Admin') {
                        navigation.navigate('Admin Home');
                    }
                    else if(role === 'User') {
                        navigation.navigate('User Home');
                    }
                }, 3000);
            } else {
                Alert.alert(json.error || 'Unknown error');
            }
        } catch (error) {
            Alert.alert('Error submitting data!', error.message);
        }
    };
    
    return (
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <CustomForm
                    title="Appliance Energy Usage Data"
                    registerQuestion={false}
                    fields={[
                        { name: 'appliance', label: 'Appliance', type: 'picker', options: appliances, placeholder: "Select appliance from below:", required: true },
                        { name: 'timeDuration', label: 'Time (hours)', type: 'number', placeholder: "Time (hours)", required: true },
                        { name: 'date', label: 'Date', type: 'date', placeholder: "Date:", required: true },
                        { name: 'startingTime', label: 'Starting time', type: 'time', placeholder: "Starting time:", required: true },
                    ]}
                    buttonText={"Submit"}
                    buttonIcon={"check"}
                    onSubmit={handleSubmit}
                />
            </View>
            <Modal transparent={true} visible={modalVisibleAppliance} animationType="fade">
                <View style={styles.modal}>
                    <View>
                        <Text style={styles.modalText}>
                            Appliance usage successfully added.{"\n"}
                            Total consumption: {totalKWh} KWh.{"\n"}
                            Total cost: {totalCost} den
                        </Text>
                    </View>
                </View>
            </Modal>
        </PageLayout>
    );
};

export default ApplianceEnergyUsage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        width: '100%'
    },
    modal: {
        flex: 1,
        width:'100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding:20,
        marginTop:22
    },
    modalText: {
        backgroundColor:'#4ADEDE',
        color: '#F3F3F3',
        padding: 20,
        borderRadius: 20,
        textAlign: 'center'
    }
});
