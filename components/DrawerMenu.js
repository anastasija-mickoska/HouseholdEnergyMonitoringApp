import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const drawerRoutes = ['Home', 'Insights', 'Add Usage', 'Notifications', 'Logout'];

export default function DrawerMenu({ navigation, closeDrawer }) {
  return (
    <View style={styles.drawer}>
      {drawerRoutes.map((route) => (
        <TouchableOpacity
          key={route}
          style={styles.drawerItem}
          onPress={() => {
            navigation.replace(route);
            closeDrawer();
          }}
        >
            <Text style={styles.drawerText}>{route}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    top: 60,
    left: 0,
    backgroundColor: '#1CA7EC',
    width: '100%',
    paddingVertical: 10,
  },
  drawerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1AA7EC',
  },
  drawerText: {
    color: '#F3F3F3',
    fontSize: 16,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    letterSpacing: 0.80
  },
});
