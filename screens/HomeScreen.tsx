import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import RenderTitle from '../components/Title';

import { RootTabScreenProps } from '../types';

const { width, height } = Dimensions.get("screen");


export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const [isBusy, setIsBusy] = useState(false);
  const colorScheme = useColorScheme();


  return (
    <View style={styles.container}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <RenderTitle title='Home' />

      <TouchableOpacity
      onPress={() => {}}
       style={{ height: width * 0.2, width: width * 0.9, alignSelf: 'center', alignItems: 'center', backgroundColor: 'grey', borderRadius: 12 }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
          <Ionicons name="shuffle" size={scale.width * 1.2} />
          <Text style={{ fontSize: scale.width * 1.2, textAlign: 'center' }}>
            Shuffle
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
});
