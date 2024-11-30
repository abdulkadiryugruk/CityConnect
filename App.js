import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import SelectCityScreen from './src/screens/selectCity/SelectCityScreen';
import CityandContactsScreen from './src/screens/selectCity/CityandContactsScreen';
import EditScreen from './src/screens/EditScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  // const [isTutorialShown, setIsTutorialShown] = useState(false);

  // useEffect(() => {
  //   const checkTutorialStatus = async () => {
  //     const tutorialStatus = await AsyncStorage.getItem('tutorialShown');
  //     if (tutorialStatus === 'true') {
  //       setIsTutorialShown(true);
  //     }
  //   };
  //   checkTutorialStatus();
  // }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* {!isTutorialShown && ( */}
        <Stack.Screen
          name="Tutorial"
          component={TutorialScreen}
          options={{headerShown: false}}
        />
        {/* )} */}
        <Stack.Screen
          options={{headerShown: false}}
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          options={{headerShown: true}}
          name="SelectCityScreen"
          component={SelectCityScreen}
        />
        <Stack.Screen
          options={{headerShown: true}}
          name="CityandContactsScreen"
          component={CityandContactsScreen}
        />
        <Stack.Screen
          options={{headerShown: true}}
          name="EditScreen"
          component={EditScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
