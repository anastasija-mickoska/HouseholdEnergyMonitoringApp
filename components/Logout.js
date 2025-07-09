import { useNavigation } from "@react-navigation/native";
import {useEffect} from 'react';
const Logout = () => {
    const navigation=useNavigation();
    useEffect(() => {
        //logout logic here
        navigation.replace('Login');
    }, [navigation]);
}
export default Logout;
