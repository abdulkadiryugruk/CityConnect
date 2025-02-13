import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { navigationRef } from './src/services/navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import SelectCityScreen from './src/screens/selectCity/SelectCityScreen';
import CityandContactsScreen from './src/screens/selectCity/CityandContactsScreen';
import EditScreen from './src/screens/EditScreen';
import SelectContactScreen from './src/screens/selectPeople/SelectContactScreen';
import ContactAndCityScreen from './src/screens/selectPeople/ContactAndCityScreen';
import TutorialBackground from './src/screens/TutorialBackground';
import YourCityScreen from './src/screens/YourCityScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PermissionsScreen from './src/screens/settingsScreens/PermissionsScreen';




const Stack = createNativeStackNavigator();

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    checkIfFirstLaunch();
  }, []);

  const checkIfFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      setIsFirstLaunch(false);
    }
  };

  if (isFirstLaunch === null) {
    return null; // Ya da bir loading ekranı
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
      initialRouteName={isFirstLaunch ? "TutorialScreen" : "Home"}>
      {isFirstLaunch && (
          <Stack.Screen
            options={{headerShown: false}}
            name="TutorialScreen"
            component={TutorialScreen}
          />
        )}
        <Stack.Screen
          options={{headerShown: false}}
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="SelectCityScreen"
          component={SelectCityScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="CityandContactsScreen"
          component={CityandContactsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="SelectContactScreen"
          component={SelectContactScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="ContactAndCityScreen"
          component={ContactAndCityScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="EditScreen"
          component={EditScreen}
        />
        <Stack.Screen
          options={{headerShown: true}}
          name="TutorialBackground"
          component={TutorialBackground}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="YourCityScreen"
          component={YourCityScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="SettingsScreen"
          component={SettingsScreen}
        />
        <Stack.Screen
          options={{headerShown: false}}
          name="PermissionsScreen"
          component={PermissionsScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;