import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // İkonlar için


const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Merhaba',
    description: 'Uygulamamıza hoş geldiniz!',
    backgroundColor: '#fdeb93',
  },
  {
    id: '2',
    title: 'Temel Amaç',
    description: 'Rehberinizdeki kişileri istediğiniz şehirlere entegre ettikden sonra, konum değişikliğinizi algılayarak bulunduğunuz şehirdeki kişileri size bildirim olarak gönderir.',
    backgroundColor: '#a6e4d0',
  },
  {
    id: '3',
    title: 'Nasıl Kullanılır?',
    description: `
    1- Gerekli izinleri verin.(Ayarlar sekmesinden izinlerin ne için gerekli olduğunu detaylı öğrenebilirsiniz.

    2- Rehberininizdeki kişileri şehirlere göre gruplandırınç "Rehberi Tara" butonuna tıklayarak otomatik olarak ekleyin. "Manuel Ekleme" kısmından da istediğiniz gibi değişiklikler yapabilirsiniz.

    3- Cihazınızın 'Konum Servisi' açık olduğunda uygulamamız her 25 dakika da 1 bulunduğunuz şehre ekli kişiler varsa size bildirim olarak hatırlatır.

    Bildirim gelmediği durumlar:
    - Cihazınızın 'Konum Servisi' kapalı ise.
    - Bildirim izni verilmemiş ise.
    - Şehre kayıtlı kişi yok ise.
    - uygulamaya arkaplanda çalışma izni verilmemiş ise.
    - Şehir değişikliği olmamış ise(aynı şehirde iseniz, bildirim 1 kere gönderilir.).
    `,
    backgroundColor: '#e9bcbe',
  },
];

const TutorialScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animated değerler
  const animatedKutu1Color = scrollX.interpolate({
    inputRange: slides.map((_, index) => index * width),
    outputRange: slides.map((slide) => slide.backgroundColor),
  });

  const animatedKutu3Color = scrollX.interpolate({
    inputRange: slides.map((_, index) => index * width),
    outputRange: slides.map((slide) => slide.backgroundColor),
  });

  const onNextPress = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const newIndex = Math.round(value / width);
      setCurrentIndex(newIndex);
    });
    return () => {
      scrollX.removeListener(listener);
    };
  }, [scrollX]);

  return (
    <View style={styles.container}>
      {/* Arkaplan Katmanları */}
      <Animated.View style={[styles.kutu1, { backgroundColor: animatedKutu1Color }]}></Animated.View>
      <Animated.View style={[styles.kutu3, { backgroundColor: animatedKutu3Color }]}></Animated.View>
      <View style={styles.kutu2}></View>

      {/* İçerik */}
      <View style={styles.content}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={onNextPress}>
          {/* <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Bitti' : 'Sonraki'}
          </Text> */}
          <Icon name="arrow-right-alt" size={40} color="black"/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  kutu1: {
    width: '100%',
    height: '70%',
    borderBottomRightRadius: 85,
    position: 'absolute',
  },
  kutu2: {
    width: '100%',
    height: '30%',
    backgroundColor: '#fff',
    borderTopLeftRadius:85,
    bottom: 0,
    position: 'absolute',
  },
  kutu3: {
    width: '100%',
    height: '30%',
    position: 'absolute',
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
    height:'80%',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginTop: height * 0.05,
  },
  description: {
    fontSize: 19,
    color: '#555',
    marginTop: 10,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  button: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#f3f3f5',
    borderRadius: 50,
  },
  pagination: {
    position: 'absolute',
    bottom: 140,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  activeDot: { backgroundColor: '#2cb9b0' },
  inactiveDot: { backgroundColor: '#ccc' },
});

export default TutorialScreen;
