import React, {useEffect} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TutorialScreen = ({navigation}) => {
  const Done = ({...props}) => (
    <TouchableOpacity
      {...props}
      onPress={async () => {
        // TODO AsyncStorage icin duzenlenecek
        // await AsyncStorage.setItem("tutorialShown", "true");
        navigation.replace('Home');
      }}>
      <Text style={styles.doneText}>Bitti</Text>
    </TouchableOpacity>
  );

  // TODO burasi AsyncStorage icin duzenlenecek
  //   useEffect(() => {
  //     const checkTutorialStatus = async () => {
  //       const tutorialStatus = await AsyncStorage.getItem("tutorialShown");
  //       if (tutorialStatus === "true") {
  //         // Eğer tutorial daha önce gösterildiyse Home ekranına yönlendir
  //         navigation.replace("Home");
  //       }
  //     };
  //     checkTutorialStatus();
  //   }, [navigation]);

  return (
    <View style={styles.container}>
      <Onboarding
        DoneButtonComponent={Done}
        showSkip={false}
        pages={[
          {
            backgroundColor: '#a6e4d0',
            title: 'Merhaba',
            subtitle: 'Uygulamamiza hos geldiniz!',
          },
          {
            backgroundColor: '#fdeb93',
            title: 'Temel Amac',
            subtitle:
              'Bulundugunuz sehrin konumunu kullanarak, o sehre entegre edilen kisileri, sizlere bildirim olarak hatirlatiyoruz.',
          },
          {
            backgroundColor: '#e9bcbe',
            title: 'Kimler Icin Faydali?',
            subtitle:
              'Oncelikli olarak toptancilar ve pazarlamacilar baz alinmistir. Ayrica akraba ve arkadas ziyaretleri icin de kullanisli bir uygulamadir.',
          },
          {
            backgroundColor: '#0080FF',
            title: 'Nasil Kullanilir?',
            subtitle:
              'Rehber erisim izni ile rehberinizi tarar ve sehirlere entegre edebilmenizi saglar.\n \n Konum izni ile bulundugunuz sehirdeki kisileri size bildirim olarak hatirlatir.  \n \n NOT: Uygulamamiz Internet baglantisi gerektirmez. bu sebeple butun veriler sadece cihaziniza kaydedilmektedir. hic bir kullanicinin erisimi yoktur.',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  doneText: {
    fontSize: 16,
    marginHorizontal: 20,
    fontWeight: 'bold',
    color: 'blue', // İstediğiniz renkte değiştirebilirsiniz
  },
});

export default TutorialScreen;
