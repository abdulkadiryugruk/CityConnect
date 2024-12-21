import {StyleSheet, TextInput} from 'react-native';
import React from 'react';

const CustomTextInput = ({placeholder, value, onChangeText}) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="gray"
      value={value}
      onChangeText={onChangeText}
    />
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    width: '90%',
    height: 50,
    marginHorizontal: '5%',
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    fontSize: 22,
  },
});
