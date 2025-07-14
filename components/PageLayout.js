import { View, StyleSheet, Pressable } from 'react-native';
import AppHeader from './AppHeader';
import DrawerMenu from './DrawerMenu';
import { useState } from 'react';
import { BlurView } from 'expo-blur';

export default function PageLayout({ navigation, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <View style={styles.layout}>
      <AppHeader onMenuToggle={toggleDrawer} />
      <View style={styles.container}>
        {children}
      </View>

      {drawerOpen && (
        <>
          <Pressable style={styles.blurContainer} onPress={() => setDrawerOpen(false)}>
            <BlurView intensity={80} tint="dark" style={styles.blurOverlay} />
          </Pressable>

          <View style={styles.drawer}>
            <DrawerMenu navigation={navigation} closeDrawer={() => setDrawerOpen(false)} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F3F3F3',
    padding:10
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
  },
  blurOverlay: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 100,
    left: 0,
    width: '100%',
    height: 'auto',
    zIndex: 10,
    backgroundColor: 'white',
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
