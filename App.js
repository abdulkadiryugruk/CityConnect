import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NotificationService from './src/services/notification/notificationService'

import HomeScreen from './src/screens/HomeScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import SelectCityScreen from './src/screens/selectCity/SelectCityScreen';
import CityandContactsScreen from './src/screens/selectCity/CityandContactsScreen';
import EditScreen from './src/screens/EditScreen';
import SelectContactScreen from './src/screens/selectPeople/SelectContactScreen';
import ContactAndCityScreen from './src/screens/selectPeople/ContactAndCityScreen';
import TutorialBackground from './src/screens/TutorialBackground';
import YourCityScreen from './src/screens/YourCityScreen';

const Stack = createNativeStackNavigator();


export const navigationRef = React.createRef();


const App = () => {
  // const [isTutorialShown, setIsTutorialShown] = useState(false);

  // useEffect(() => {
  //   const checkTutorialStatus = async () => {
  //     const tutorialStatus = await AsyncStorage.getItem('tutorialShown');
  //     if (tutorialStatus === 'true') {
  //       setIsTutorialShown(true);
  //     } else {
  //       setIsTutorialShown(false);
  //     }
  //   };
  //   checkTutorialStatus();
  // }, []);

//TODO bildirim
useEffect(() => {
  NotificationService.init();
}, []);


  return (
    <NavigationContainer ref={navigationRef}>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
