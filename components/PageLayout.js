import { View, useState } from 'react-native';
import AppHeader from './AppHeader.js';
import DrawerMenu from './DrawerMenu.js';

export default function PageLayout({ navigation, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <View style={{ flex: 1 }}>
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
