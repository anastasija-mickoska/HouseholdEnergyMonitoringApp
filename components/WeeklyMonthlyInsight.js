import Insight from "./Insight";
import {View, Text,StyleSheet} from 'react-native';

const WeeklyMonthlyInsight = ({title, texts, values}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Insight title={title} text={texts[0]} value={values[0]} />
            <Insight title={title} text={texts[1]} value={values[1]} />
            {texts.length > 2 && values.length > 2 && 
                <Insight title={title} text={texts[2]} value={values[2]}/>
            }
        </View>
    );
}

export default WeeklyMonthlyInsight;

const styles=StyleSheet.create({
    container: {
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        gap:20,
        backgroundColor: 'rgba(26, 167, 236, 0.10)',
        borderRadius:20,
        padding:20,
        width:'100%'
    },
    title: {
        color: '#1F2F98',
        fontSize: 24,
        fontFamily: 'Roboto Flex',
        fontWeight: '700',
        letterSpacing: 1.2
    }
});