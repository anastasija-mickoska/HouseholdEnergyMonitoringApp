import Insight from "./Insight";
import {View, Text,StyleSheet} from 'react-native';

const WeeklyMonthlyInsight = ({title, texts, values}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Insight title={title} text={texts[0]} value={values[0]} />
            <Insight title={title} text={texts[1]} value={values[1]} />
        </View>
    );
}

export default WeeklyMonthlyInsight;

const styles=StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center'
    },
    title: {
        color: '#1F2F98',
        fontSize: 24,
        fontFamily: 'Roboto Flex',
        fontWeight: 600,
        letterSpacing: 1.2
    }
});