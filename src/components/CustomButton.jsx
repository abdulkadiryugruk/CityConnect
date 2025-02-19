import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';

const CustomButton = ({buttonText, pressed, customStyle, textStyle}) => {
  return (
    <TouchableOpacity
      style={[styles.buttonStyle, customStyle]}
      onPress={pressed}>
      <Text style={[styles.buttonTextStyle, textStyle]}>{buttonText}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  buttonStyle: {
    backgroundColor: '#2cb9b0',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    height: 50,
    marginVertical: 25,
    borderRadius: 50,
    elevation: 10,
//  borderWidth:0.5,
  },
  buttonTextStyle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '600',
  },
});
