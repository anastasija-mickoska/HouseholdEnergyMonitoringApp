import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {useEffect} from 'react';
import {auth} from '../firebase';
import { signOut } from "firebase/auth";

const Logout = () => {
    const navigation=useNavigation();
    useEffect(() => {
        const doLogout = async () => {
        try {
            await signOut(auth);                 
            await AsyncStorage.clear();         
            navigation.replace('Login');        
        } catch (error) {
            console.error("Logout error:", error);
        }
        };
        doLogout();
    }, [navigation]);
}
export default Logout;
