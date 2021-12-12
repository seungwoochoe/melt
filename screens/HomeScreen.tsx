import * as React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import RenderBottomBar from '../components/BottomBar';
import RenderTitle from '../components/Title';

import { RootTabScreenProps } from '../types';

const { width, height } = Dimensions.get("screen");


export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {
  const [isBusy, setIsBusy] = React.useState(false);
  const colorScheme = useColorScheme();


  return (
    <View style={styles.container}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <RenderTitle title='Home'/>

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
