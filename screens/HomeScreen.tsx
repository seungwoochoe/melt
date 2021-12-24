import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Dimensions, Image, StatusBar, Animated, Platform, FlatList } from 'react-native';
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
    <View style={{
      flex: 1,
      width: width,
    }}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <RenderTitle title='Home' />

      <TouchableOpacity
        onPress={async () => {
          await Player.createNewTracks();
          await Player.play();
        }}
        style={{
          height: width * 0.25,
          width: width * 0.9,
          alignSelf: 'center',
          alignItems: 'center',
          backgroundColor: colorScheme === 'light' ? Colors.light.background : Colors.dark.background,
          borderRadius: 10,
          marginTop: 20,
          shadowColor: 'black',
          shadowOpacity: .28,
          shadowRadius: layout.width*0.5,
          shadowOffset: {width: layout.width * 0.03, height: layout.width * 0.2},
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
          <Ionicons name="shuffle" size={layout.width * 1.7} color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text} />
          <Text style={{ fontSize: layout.width * 1.4, textAlign: 'center', color: colorScheme === 'dark' ? Colors.dark.text : Colors.light.text, marginLeft: layout.width * 0.4, fontWeight: '600' }}>
            Shuffle!
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
