import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AppHeader({ onMenuToggle }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuToggle} style={styles.menu}>
        <Image source={require('../assets/images/navbar.png')}/>
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
  },
  menu: {
    width:25,
    height:25,
    marginLeft:30
  }
});
