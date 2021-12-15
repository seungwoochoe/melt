import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions, StatusBar, Platform, TextInput, KeyboardAvoidingView, Keyboard, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import filter from 'lodash.filter';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Music } from '../types';
import RenderHeader from '../components/Header';
import RenderTitle from '../components/Title';
import Player from '../containers/Player';
import RenderSong from '../components/Song';


const { width, height } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.149;
const bottomBarHeight = listHeightWithoutScale * 1.2;


export default function SongsScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [filteredMusicList, setFilteredMusicList] = useState<Music[]>([]);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);
  const [isScrolled, setIsScrelled] = useState(false);

  const colorScheme = useColorScheme();
  const listHeight = listHeightWithoutScale * useWindowDimensions().fontScale;

  const keyExtractor = useCallback((item) => item.id, []);


  useEffect(() => {
    const keyboardShowSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardShown(true);
    });

    const keyboardHideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardShown(false);
    });

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    }
  }, []);


  function handleSearch(query: string) {
    let safeQuery = query;
    const blacklist = ['^', '.', '[', ']', '$', '(', ')', '\\', '*', '{', '}', '?', '+',];

    for (const item of blacklist) {
      safeQuery = safeQuery.replaceAll(item, '');
    }

    const filteredData = filter(Player.musicList, music => {
      return search(music, safeQuery.toLowerCase());
    })
    setFilteredMusicList(filteredData);
    setQuery(query);
  }

  function search({ title, artist }: { title: string, artist: string }, query: string) {
    const condition = new RegExp(`^${query}| ${query}|\\(${query}`);
    if (title.toLowerCase().match(condition) || artist.toLowerCase().match(condition)) {
      return true;
    }
    return false;
  }



  const RenderNoResult = () => {
    return (
      <View style={{ height: height * 0.35, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <Text style={{ fontSize: layout.width * 1.2, color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
          No results
        </Text>
      </View>
    )
  }

  const RenderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          marginLeft: listHeightWithoutScale + marginBetweenAlbumartAndText + width * 0.045,
          marginRight: width * 0.06,
        }}
        lightColor='#dfdfdf'
        darkColor='#343434'
      />
    )
  }

  const RenderBottomMargin = () => {
    return (
      <>
        {(Player.musicList.length !== 0 && (query.length === 0 || filteredMusicList.length !== 0)) &&
          <RenderSeparator />
        }

        <View style={{ height: isKeyboardShown ? 0 : bottomBarHeight * 0.99, alignItems: 'center', paddingTop: bottomBarHeight * 0.1 }}>
          <Text style={{ fontSize: layout.width * 0.95, fontWeight: '400', color: colorScheme === 'light' ? '#b7b7b7' : '#666' }}>
            {/* - {Player.musicList.length} songs - */}
          </Text>
        </View>
      </>
    )
  }


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>

      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <FlatList
          data={query.length === 0 ? Player.musicList : filteredMusicList}
          ListEmptyComponent={RenderNoResult}
          // stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View style={{marginBottom: layout.width}}>
              <RenderTitle title='Songs' />
            </View>
          }
          ItemSeparatorComponent={RenderSeparator}
          ListFooterComponent={RenderBottomMargin}
          renderItem={({ item }) => {
            return (
              <RenderSong item={item} colorScheme={colorScheme} />
            );
          }}
          onScroll={(event) => {
            const scrollOffset = event.nativeEvent.contentOffset.y;

            if (scrollOffset < layout.width * 2.05) {
              if (isScrolled === true) {
                setIsScrelled(false);
              }
            } else {
              if (isScrolled === false) {
                setIsScrelled(true);
              }
            }
          }}
          showsVerticalScrollIndicator={true}
          scrollIndicatorInsets={{top: layout.ratio * 2.9 * useWindowDimensions().fontScale , left: 0, bottom: isKeyboardShown ? 0 : bottomBarHeight * 0.99, right: 0}}
          keyboardShouldPersistTaps='handled'
          scrollEnabled={query.length !== 0 && filteredMusicList.length === 0 ? false : true}
          keyExtractor={keyExtractor}
          getItemLayout={(data, index) => (
            { length: listHeight + 1, offset: (listHeight + 1) * index, index }
          )}
        />
      </View>

      <RenderHeader title='Songs' blur={isScrolled} />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  miniArt: {
    width: listHeightWithoutScale * 0.88,
    height: listHeightWithoutScale * 0.88,
    margin: listHeightWithoutScale * 0.06,
    borderRadius: 4.5,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
