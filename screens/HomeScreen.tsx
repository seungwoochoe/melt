import React, { useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, Dimensions, StatusBar, Animated, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import RenderHeader from '../components/Header';
import RenderTitle from '../components/Title';
import Player from '../containers/Player';
import RenderSong from '../components/Song';
import { Music } from '../types';
import RenderSeparator from '../components/Separator';
import { useIsFocused } from '@react-navigation/native';

import { RootTabScreenProps } from '../types';

const { width, height } = Dimensions.get("screen");


export default function HomeScreen({ navigation }: RootTabScreenProps<'Home'>) {

  const [isScrolled, setIsScrolled] = useState(false);
  const colorScheme = useColorScheme();

  const listHeight = layout.listHeightWithoutScale * useWindowDimensions().fontScale;

  const isFocused = useIsFocused();


  const data = Player.homeSongs;

  
  useEffect(() => {
    async function updateHomeMusicIfEnoughTimeHasPassed() {
      const UPDATE_INTERVAL = 30 * 60 * 1000;

      let lastHomeUpdateTime = 0;
      try {
        const jsonValue = await AsyncStorage.getItem('lastHomeUpdateTime');
        lastHomeUpdateTime = jsonValue != null ? JSON.parse(jsonValue) : 0;
      } catch (e) {
        // console.warn(e);
      }

      if (Date.now() - lastHomeUpdateTime > UPDATE_INTERVAL) {
        try {
          Player.updateSongsForHomeScreen();

					const jsonValue = JSON.stringify(lastHomeUpdateTime);
					await AsyncStorage.setItem('lastHomeUpdateTime', jsonValue);
				} catch (e) {
					// console.warn(e);
				}
      }
    }
    updateHomeMusicIfEnoughTimeHasPassed();
  }, [isFocused]);

  

  const keyExtractor = useCallback((item) => item.id, []);


  const RenderShuffleButton = () => {
    return (
      <TouchableOpacity
        onPress={async () => {
          await Player.createNewTracks();
          await Player.play();
        }}
        style={{
          height: width * 0.16,
          width: width * 0.9,
          alignSelf: 'center',
          alignItems: 'center',
          backgroundColor: colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor,
          borderRadius: 10,
          marginTop: 20,
          marginBottom: 16,
          shadowColor: 'black',
          shadowOpacity: .2,
          shadowRadius: layout.width * 0.4,
          shadowOffset: { width: layout.width * 0.03, height: layout.width * 0.2 },
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
          <Ionicons name="shuffle" size={layout.width * 1.7} color={colorScheme === 'light' ? Colors.dark.text : Colors.light.text} />
          <Text style={{ fontSize: layout.width * 1.4, textAlign: 'center', color: colorScheme === 'light' ? Colors.dark.text : Colors.light.text, marginLeft: layout.width * 0.4, fontWeight: '600' }}>
            Shuffle
          </Text>
        </View>
      </TouchableOpacity>

    );
  }

  const RenderBottomMargin = () => {
    if (data.length !== 0) {
      return (
        <>
          <RenderSeparator />
          <View style={{ height: layout.bottomBarHeight * 0.975, alignItems: 'center', paddingTop: layout.bottomBarHeight * 0.1 }} />
        </>
      )
    }
    return (
      <View style={{ height: layout.bottomBarHeight * 0.975, alignItems: 'center', paddingTop: layout.bottomBarHeight * 0.1 }} />
    )
  }

  const renderItem = ({ item }: { item: Music }) => (<RenderSong item={item} colorScheme={colorScheme} />);


  return (
    <View style={{ flex: 1, width: width, }}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <FlatList
          data={data}

          ListHeaderComponent={
            <>
              <RenderTitle title='Home' />
              <RenderShuffleButton />

              <Text style={{
                width: width * 0.935,
                fontSize: layout.width * 1.37,
                fontWeight: 'bold',
                marginLeft: width * 0.065,
                marginTop: layout.height * 1.5,
                marginBottom: layout.height * 0.6,
                color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text,
              }}>
                Start listening with
              </Text>
            </>
          }

          ListEmptyComponent={() => {
            return (
              <View style={{ height: height * 0.3, width: width, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: layout.width * 1.1, fontWeight: '400', color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
                  Welcome!{'\n'}{'\n'}
                  Finder (macOS) or{'\n'}
                  iTunes (Windows).
                </Text>
              </View>
            )
          }}

          renderItem={renderItem}
          ItemSeparatorComponent={RenderSeparator}

          ListFooterComponent={<RenderBottomMargin />}

          onScroll={(event) => {
            const scrollOffset = event.nativeEvent.contentOffset.y;

            if (scrollOffset < layout.width * 2.05) {
              if (isScrolled === true) {
                setIsScrolled(false);
              }
            } else {
              if (isScrolled === false) {
                setIsScrolled(true);
              }
            }
          }}

          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          keyExtractor={keyExtractor}
        />
      </View>

      <RenderHeader title='Home' blur={isScrolled} />

    </View>
  );
}
