import React from 'react';
import {View, Image, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const PlaceholderImage = () => (
  <View style={{width: 100, height: 100, backgroundColor: 'transparent'}} />
);

const TutorialScreen = ({navigation}) => {
  const Done = ({...props}) => (
    <TouchableOpacity
      {...props}
      onPress={async () => {
        navigation.replace('Home');
      }}>
      <Text style={styles.doneText}>Bitti</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Onboarding
        DoneButtonComponent={Done}
        showSkip={false}
        pages={[
          {
            backgroundColor: '#a6e4d0',
            title: 'Merhaba',
            subtitle: 'Uygulamamıza hoş geldiniz!',
            image: <PlaceholderImage />, // Boş bir View ekleniyor
          },
          {
            backgroundColor: '#fdeb93',
            title: 'Temel Amaç',
            subtitle:
              'Bulunduğunuz şehrin konumunu kullanarak, o şehre entegre edilen kişileri, sizlere bildirim olarak hatırlatıyoruz.',
            image: <PlaceholderImage />,
          },
          {
            backgroundColor: '#e9bcbe',
            title: 'Kimler İçin Faydalı?',
            subtitle:
              'Öncelikli olarak toptancılar ve pazarlamacılar baz alınmıştır. Ayrıca akraba ve arkadaş ziyaretleri için de kullanışlı bir uygulamadır.',
            image: <PlaceholderImage />,
          },
          {
            backgroundColor: '#0080FF',
            title: 'Nasıl Kullanılır?',
            subtitle:
              'Rehber erişim izni ile rehberinizi tarar ve şehirlere entegre edebilmenizi sağlar.\n\nKonum izni ile bulunduğunuz şehirdeki kişileri size bildirim olarak hatırlatır.\n\nNOT: Uygulamamız internet bağlantısı gerektirmez. Bu sebeple bütün veriler sadece cihazınıza kaydedilmektedir. Hiçbir kullanıcının erişimi yoktur.',
            image: <PlaceholderImage />,
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
    color: 'blue',
  },
});

export default TutorialScreen;
