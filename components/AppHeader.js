import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';

export default function AppHeader({ onMenuToggle }) {
  return (
    <View style={styles.header}>
      <StatusBar backgroundColor="#1CA7EC" barStyle="light-content" />
      <TouchableOpacity onPress={onMenuToggle} style={styles.menu}>
        <Image source={require('../assets/images/navbar.png')} style={styles.icon}/>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width:'100%',
    height: 80,
    backgroundColor: '#1CA7EC',
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems:'flex-end',
    justifyContent:'flex-start',
    paddingVertical:20
  },
  menu: {
    width:25,
    height:25,
    marginLeft:20,
    justifyContent:'center',
    alignItems:'center'
  },
  icon: {
    height:25,
    width:25,
    alignItems:'center'
  }
});
