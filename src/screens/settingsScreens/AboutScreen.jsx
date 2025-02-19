import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Linking} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AboutScreen = ({navigation}) => {
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
              style={{transform: [{rotate: '180deg'}]}}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hakkında</Text>
          <View style={styles.rightIcon} />
        </View>
      </View>
      <View style={styles.backgroundBottom}>
        <View style={styles.backgroundTopRight}></View>
        <View style={styles.body}>
          <Text style={styles.title}>CityConnect</Text>
          <Text style={styles.version}>Sürüm: 1.0.0</Text>
          <Text style={styles.description}>
            CityConnect, telefon rehberinizdeki kişileri, şehirlere göre
            organize etmenize yardımcı olur. Ayrıca, şehir değiştirildiğinde
            bildirim göndererek sizi bilgilendirir.
          </Text>
          <Text style={styles.sectionTitle}>İletişim & Destek</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('mailto:cityconnectdestek@gmail.com')
            }>
            <Text style={styles.link}>📧 cityconnectdestek@gmail.com</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => Linking.openURL('https://cityconnect.com')}>
          <Text style={styles.link}>🌐 Web Sitesi</Text>
        </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                'https://github.com/abdulkadiryugruk/CityConnect-policy/blob/main/privacy-policy.md',
              )
            }>
            <Text style={styles.privacyLink}>📜 Gizlilik Politikası</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                'https://github.com/abdulkadiryugruk/CityConnect-policy/blob/main/terms-of-use.md',
              )
            }>
            <Text style={styles.privacyLink}>📜 Kullanım Koşulları</Text>
          </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  version: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 20,
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
  top: {
    width: '100%',
    height: '50%',
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

export default AboutScreen;
