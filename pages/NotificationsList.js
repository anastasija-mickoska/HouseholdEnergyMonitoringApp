import { ScrollView } from "react-native-gesture-handler";
import PageLayout from "../components/PageLayout";

const NotificationsList = ({navigation, notifications}) => {
    return(
        <PageLayout navigation={navigation}>
            <View style={styles.container}>
                <Text style={styles.title}>Notifications</Text>
                <ScrollView>
                {
                    notifications.map((item, index) => (
                        <Notification notification = {item.text} date = {item.date}/>
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
        flex:1
    },
    title: {
        color: '#1F2F98',
        fontSize: 32,
        fontFamily: 'Roboto Flex',
        fontWeight: 700,
        letterSpacing: 1.6
    }
});