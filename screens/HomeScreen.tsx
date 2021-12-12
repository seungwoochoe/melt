import * as React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import { Music, Track } from '../types';
import RenderBottomBar from '../components/BottomBar';

import Player from '../containers/Player';
import { RootTabScreenProps } from '../types';

const { width, height } = Dimensions.get("screen");
const listHeight = width * 0.149;


export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const [isBusy, setIsBusy] = React.useState(false);
  const colorScheme = useColorScheme();


  return (
    <View style={styles.container}>
      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <View style={{ height: scale.ratio * 8, flexDirection: 'row', paddingTop: '5%', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: scale.width * 1.9, fontWeight: 'bold', marginHorizontal: width * 0.06, }}>
          Home
        </Text>
      </View>

      <RenderBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
});
