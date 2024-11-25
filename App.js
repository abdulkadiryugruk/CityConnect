import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import TutorialScreen from './screens/TutorialScreen';
import SelectCityScreen from './screens/selectCity/SelectCityScreen';


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
            options={{ headerShown: false }}
          />
        {/* )} */}
        <Stack.Screen
        options={{ headerShown: false }}
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
        options={{ headerShown: true }}
          name="SelectCityScreen"
          component={SelectCityScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
