import {StyleSheet,View} from 'react-native';
import React from 'react';

const CustomBody = () => {
  return (
    <View style={styles.container}>
		<View style={styles.top}>
		<View style={styles.backgroundTop}></View>
		<View style={styles.backgroundTopRight}></View>
		</View>
		<View style={styles.backgroundBottom}>
			<View style={styles.body}></View>
		</View>
      <View style={styles.body}></View>
    </View>
  );
};

export default CustomBody;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  top:{
	width:'100%',
	height:'50%',
  },
  backgroundTop: {
    width: '100%',
    height: '22%',
    borderBottomLeftRadius: 85,
    backgroundColor: '#2cb9b0',
	position:'absolute',
	top:0,
  },
  backgroundTopRight:{
	width:'20%',
	height:'40%',
    backgroundColor: '#2cb9b0',
position:'absolute',
right:0,
top:0,
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
});
