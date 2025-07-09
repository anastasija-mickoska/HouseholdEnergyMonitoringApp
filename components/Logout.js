import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {useEffect} from 'react';
const Logout = () => {
    const navigation=useNavigation();
    useEffect(() => {
        AsyncStorage.clear();
        navigation.replace('Login');
    }, [navigation]);
}
export default Logout;
