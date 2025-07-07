import { View, StyleSheet } from 'react-native';
import AppHeader from './AppHeader.js';
import DrawerMenu from './DrawerMenu.js';
import { useState } from 'react';

export default function PageLayout({ navigation, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <View style={styles.container}>
      <AppHeader onMenuToggle={toggleDrawer}/>
      {drawerOpen && (
        <DrawerMenu navigation={navigation} closeDrawer={() => setDrawerOpen(false)} />
      )}
      <View style={{ flex: 1}}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor:'#F3F3F3'
  }
})
