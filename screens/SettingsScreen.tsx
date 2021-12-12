import * as React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import RenderDarkHeader from '../components/DarkHeader';
import RenderTitle from '../components/Title';

import { RootTabScreenProps } from '../types';

const { width, height } = Dimensions.get("screen");

export default function SettingsScreen({ navigation }: RootTabScreenProps<'Settings'>) {

  const colorScheme = useColorScheme();

  return (
    <View style={{flex: 1, width: width, backgroundColor: colorScheme === 'light' ? '#f2f2f7' : '#000'}}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <RenderTitle title='Settings'/>




      <RenderDarkHeader title='Settings' blur={false} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    // backgroundColor: 'green'
  },
});