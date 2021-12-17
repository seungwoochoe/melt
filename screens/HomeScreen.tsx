import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import RenderTitle from '../components/Title';
import Player from '../containers/Player';

import { RootTabScreenProps } from '../types';

const { width, height } = Dimensions.get("screen");


export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {

  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <RenderTitle title='Home' />

      <TouchableOpacity
        onPress={async () => {
          await Player.createNewTracks();
          await Player.play();
        }}
        style={{
          height: width * 0.2,
          width: width * 0.9,
          alignSelf: 'center',
          alignItems: 'center',
          backgroundColor: colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3,
          borderRadius: 12,
          marginTop: 20,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
          <Ionicons name="shuffle" size={layout.width * 1.2} />
          <Text style={{ fontSize: layout.width * 1.2, textAlign: 'center' }}>
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
