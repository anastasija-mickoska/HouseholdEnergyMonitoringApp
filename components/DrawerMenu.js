import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const drawerRoutes = [
  { name: 'Home', img: require('../assets/images/home.png') },
  { name: 'Add Usage', img: require('../assets/images/add.png') },
  { name: 'Insights', img: require('../assets/images/bar_chart.png') },
  { name: 'Notifications', img: require('../assets/images/notifications.png') },
  { name: 'Logout', img: require('../assets/images/logout.png') },
];

export default function DrawerMenu({ navigation, closeDrawer }) {
  const [role, setRole] = useState(null);

  useEffect(()=> {
    const getRole = async() => {
      const storedRole = await AsyncStorage.getItem('role');
      setRole(storedRole);
    }
    getRole();
  }, []);

  return (
    <View style={styles.drawer}>
      {drawerRoutes.map((route) => (
        <TouchableOpacity
          key={route.name}
          style={styles.drawerItem}
          onPress={() => {
            if(route.name == 'Home') {
              if(role == 'Admin') {
                navigation.replace('Admin Home');
              }
              else if(role === 'User') {
                navigation.replace('User Home');
              }
            }
            else {
              navigation.replace(route.name);
            }
            closeDrawer();
          }}
        >
          <Image source={route.img} style={styles.icon} />
          <Text style={styles.drawerText}>{route.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: '#1CA7EC',
    width: '100%',
    paddingVertical: 10,
    elevation: 5,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  drawerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1AA7EC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerText: {
    color: '#F3F3F3',
    fontSize: 16,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    letterSpacing: 0.8,
    marginLeft: 15,
  },
  icon: {
    height: 25,
    width: 25,
  },
});
