import {StyleSheet, TextInput} from 'react-native';
import React from 'react';

const CustomTextInput = ({placeholder, value, onChangeText}) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#fff"
      value={value}
      onChangeText={onChangeText}
    />
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    width: '70%',
    height: 50,
    marginHorizontal: '15%',
    marginVertical: 12,
    borderWidth: 1,
    borderColor:'lightgrey',
    padding: 10,
    borderRadius: 85,
    fontSize: 22,
  },
});
