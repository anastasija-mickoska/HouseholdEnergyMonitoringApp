import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function AppHeader({ onMenuToggle }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuToggle} style={styles.menu}>
        <Image source={require('../assets/images/navbar.png')} style={styles.icon}/>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width:'100%',
    height: 60,
    backgroundColor: '#1CA7EC',
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems:'center'
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
