import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requestContactPermission } from '../../permissions/ContactsPermission';
import { NotificationPermissionManager } from '../../permissions/NotificationPermission';
import { requestLocationPermission } from '../../permissions/LocationPermission';
import { checkAndHandleAutoStartPermission } from '../../permissions/XiaomiSettings';

const PermissionsScreen = () => {
  const [expandedPermissions, setExpandedPermissions] = useState({});

  const togglePermissions = (permissionName) => {
    setExpandedPermissions(prev => ({ ...prev, [permissionName]: !prev[permissionName] }));
  };

  const handlePermissionRequest = async (permission) => {
    switch (permission) {
      case 'Rehber İzni':
        await requestContactPermission();
        break;
      case 'Bildirim İzni':
        await NotificationPermissionManager.checkPermission();
        break;
      case 'Konum İzni':
        await requestLocationPermission();
        break;
      case 'Uygulama Kapalıyken Başlatma İzni':
        await checkAndHandleAutoStartPermission();
        break;
      default:
        break;
    }
  };

  const permissions = [
    { name: 'Rehber İzni', description: 'Rehberinizdeki kişileri şehirlere entegre etmek için gerekli.' },
    { name: 'Bildirim İzni', description: 'Bulunduğunuz şehirdeki kişileri bildirim olarak göndermek için gerekli.' },
    { name: 'Konum İzni', description: 'Hangi şehirde bulunduğunuzu tespit edebilmek için gerekli.' },
    { name: 'Uygulama Kapalıyken Başlatma İzni', description: 'Bazı cihazlarda uygulama kapalıyken de konum bilgisine erişerek bildirim gönderebilmek için gerekli.' },
  ];

  return (
    <View style={styles.container}>
      {permissions.map((item) => (
        <View key={item.name} style={styles.permissionContainer}>
          <TouchableOpacity style={styles.permissionHeader} onPress={() => togglePermissions(item.name)}>
            <Text style={styles.permissionName}>{item.name}</Text>
            <Icon name={expandedPermissions[item.name] ? 'keyboard-arrow-down' : 'keyboard-arrow-left'} size={24} color="tomato" />
          </TouchableOpacity>
          {expandedPermissions[item.name] && (
            <View style={styles.permissionDetails}>
              <Text style={styles.permissionText}>{item.description}</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={() => handlePermissionRequest(item.name)}>
                <Text style={styles.buttonText}>Yönlendir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  permissionContainer: { marginVertical: 5 },
  permissionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#f5f5f5', borderRadius: 5 },
  permissionName: { fontSize: 18, color: 'black' },
  permissionDetails: { marginTop: 5, padding: 10, backgroundColor: '#fff' },
  permissionText: { fontSize: 16, color: 'gray' },
  permissionButton: { marginTop: 5, backgroundColor: 'tomato', padding: 10, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default PermissionsScreen;
