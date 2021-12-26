import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Dimensions, StatusBar, Animated, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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



  const keyExtractor = useCallback((item) => item.id, []);


  const RenderShuffleButton = () => {
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
            shadowRadius: layout.width * 0.5,
            shadowOffset: { width: layout.width * 0.03, height: layout.width * 0.2 },
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

  const RenderTopSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          marginLeft: width * 0.05,
          width: width * 0.95,
        }}
        lightColor='#dfdfdf'
        darkColor='#343434'
      />
    )
  }

  const RenderBottomMargin = () => {
    if (Player.topSongs.length !== 0) {
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
          data={Player.likedSongs}

          ListHeaderComponent={<RenderShuffleButton />}

          ListEmptyComponent={() => {
            let messageText = "";
            if (Player.historyList.length > 0 && Player.musicList.length !== 0) {
              messageText = "Welcome back!\n\nPlay the songs you love."
            } else {
              messageText = "Play the songs you love."
            }

            return (
              <View style={{ height: height * 0.26, width: width, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: layout.width * 1.1, fontWeight: '400', color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
                  {messageText}
                </Text>
              </View>
            )
          }}

          renderItem={renderItem}
          ItemSeparatorComponent={RenderTopSeparator}

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

      <RenderHeader title='Library' blur={isScrolled} />

    </View>
  );
}
