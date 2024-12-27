import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';

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
    description: 'Şehirdeki kişileri kaydeder ve size bildirim olarak hatırlatır.',
    backgroundColor: '#a6e4d0',
  },
  {
    id: '3',
    title: 'Nasıl Kullanılır?',
    description: 'Rehber ve konum izni ile size en iyi hizmeti sunar.',
    backgroundColor: '#e9bcbe',
  },
];

const TutorialScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNextPress = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Home');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <Animated.View style={styles.container}>
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
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
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
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Bitti' : 'Sonraki'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: height * 0.05,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  pagination: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: { backgroundColor: 'blue' },
  inactiveDot: { backgroundColor: '#ccc' },
});

export default TutorialScreen;
