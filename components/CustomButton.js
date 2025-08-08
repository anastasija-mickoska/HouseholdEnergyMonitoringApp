import { TouchableOpacity, Text, Image, StyleSheet, View } from "react-native";

const iconMap = {
  add: require('../assets/images/add.png'),
  edit: require('../assets/images/edit.png'),
  insights: require('../assets/images/bar_chart.png'),
  notifications: require('../assets/images/notifications.png'),
  delete:require('../assets/images/delete.png')
};

const CustomButton = ({onPress, imgSource, text}) => {
    return(
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <View style={styles.buttonContent}>
                {imgSource && <Image source={iconMap[imgSource]} style={styles.icon} />}
                <Text style={styles.buttonText}>
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default CustomButton;


const styles= StyleSheet.create({
    button: {
        width: '80%',
        height: 40,
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        borderColor: '#1F2F98',
        borderWidth: 1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center', 
        gap: 10,
    },
    icon: {
        height:25,
        width:25,
        tintColor:'#1F2F98'
    },
    buttonText: {
        color: '#1F2F98',
        fontSize: 16,
        fontFamily: 'Roboto Flex',
        fontWeight: '500',
        letterSpacing: 1.6,
    }
});
