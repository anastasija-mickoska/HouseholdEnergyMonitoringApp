import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const drawerRoutes = [
  {name:'Home', img:'../assets/images/home.png'},
  {name:'Add Usage', img:'../assets/images/add.png'},
  {name:'Insights', img:'../assets/images/bar_chart.png'},
  {name:'Notifications', img:'../assets/images/notifications.png'},  
  {name:'Logout', img:'../assets/images/logout.png'},
]

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
            <Image source = {{uri:route.img}} style={styles.icon}/>
            <Text style={styles.drawerText}>{route.name}</Text>
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
    flexDirection:'row',
    alignItems:'center'
  },
  drawerText: {
    color: '#F3F3F3',
    fontSize: 16,
    fontFamily: 'Roboto Flex',
    fontWeight: '500',
    letterSpacing: 0.80,
    marginLeft: 15
  },
  icon: {
    height:25,
    width:25
  }
});
