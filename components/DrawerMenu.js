import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const drawerRoutes = [
  { name: 'Home', img: require('../assets/images/home.png') },
  { name: 'Add Usage', img: require('../assets/images/add.png') },
  { name: 'Insights', img: require('../assets/images/bar_chart.png') },
  { name: 'Notifications', img: require('../assets/images/notifications.png') },
  { name: 'Logout', img: require('../assets/images/logout.png') },
];

export default function DrawerMenu({ navigation, closeDrawer }) {
  return (
    <View style={styles.drawer}>
      {drawerRoutes.map((route) => (
        <TouchableOpacity
          key={route.name}
          style={styles.drawerItem}
          onPress={() => {
            navigation.replace(route.name);
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
