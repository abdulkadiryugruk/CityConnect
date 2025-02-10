/* eslint-disable no-mixed-spaces-and-tabs */
import React from 'react'
import {StyleSheet, Text, View,TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({navigation}) => {
  return (

		<View style={styles.container}>
			<View style={styles.backgroundTop}>
					  <View style={styles.header}>
						<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						  <Icon name="trending-flat" size={24} color="#fff" style={{ transform: [{ rotate: '180deg' }] }}/>
						</TouchableOpacity>
						<Text style={styles.headerTitle}></Text>
						<View style={styles.rightIcon} />
					  </View>
			</View>
		  <View style={styles.backgroundBottom}>
			<View style={styles.backgroundTopRight}></View>
			<View style={styles.body}>
			<View style={styles.dahasonra}>
	  <Text style={styles.text}>daha sonra ayarlanacak</Text>
	</View>
			</View>
		  </View>
		</View>


  )
}

export default SettingsScreen

const styles = StyleSheet.create({
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
	  dahasonra:{
		justifyContent: 'center',
		alignItems: 'center',

	},
	text:{
		fontSize: 30,
		color: 'black',
	},
	container: {
		flex: 1,
		backgroundColor: '#fff',
	  },
	  header: {
		width: '90%',
		height: 60,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
		marginVertical:'3%',
	  },
	  backButton: {
		padding: 10,
		backgroundColor:'#42c0b8',
		borderRadius:50,
	  },
	  headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#fff',
	  },
	  rightIcon: {
		padding: 25,
		borderRadius:50,
	  },
	});
