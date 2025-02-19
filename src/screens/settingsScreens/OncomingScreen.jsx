import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OncomingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon
              name="trending-flat"
              size={24}
              color="#fff"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gelecek Yenilikler</Text>
          <View style={styles.rightIcon} />
        </View>
      </View>

      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
          
          {/* Gelecek Yenilikler */}
          <Text style={styles.title}>Gelecek Yenilikler</Text>
          <Text style={styles.description}>
            - Konum tabanlı bildirimler daha hassas hale getirilecek.{"\n"}{"\n"}
            - Şehir değiştirme bildirimlerinde kullanıcı tercihlerine göre özelleştirme imkanı.{"\n"}{"\n"}
            - Kullanıcı geri bildirimlerine göre uygulama arayüzü ve işlevselliği iyileştirilecek.{"\n"}{"\n"}
            - Tema seçenekleri eklenecek. {"\n"}{"\n"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 20,
    textAlign: 'left',
    color: '#444',
    marginBottom: 20,
	width:'90%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  link: {
    fontSize: 16,
    color: '#2cb9b0',
    marginTop: 5,
  },
  privacyLink: {
    fontSize: 16,
    color: '#ff6347',
    marginTop: 20,
  },
  backgroundTop: {
    width: '100%',
    alignItems: 'center',
    height: '22%',
    borderBottomLeftRadius: 85,
    backgroundColor: '#2cb9b0',
    position: 'absolute',
    top: 0,
  },
  backgroundTopRight: {
    width: '20%',
    height: '50%',
    backgroundColor: '#2cb9b0',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backgroundBottom: {
    width: '100%',
    height: '78%',
    backgroundColor: '#0c0d34',
    bottom: 0,
    position: 'absolute',
  },
  body: {
    width: '100%',
    height: '85%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    borderRadius: 85,
    borderTopLeftRadius: 0,
  },
  header: {
    width: '90%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: '3%',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#42c0b8',
    borderRadius: 50,
  },
  rightIcon: {
    padding: 25,
    borderRadius: 50,
  },
});

export default OncomingScreen;
