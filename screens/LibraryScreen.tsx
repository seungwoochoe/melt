import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform, TextInput, SectionList, KeyboardAvoidingView, Keyboard, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import filter from 'lodash.filter';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import { Music, LibraryItem } from '../types';
import RenderHeader from '../components/Header';
import RenderTitle from '../components/Title';
import RenderBottomBar from '../components/BottomBar';
import Player from '../containers/Player';
import { RootTabScreenProps } from '../types';

const { width, height } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.149;
const bottomBarHeight = listHeightWithoutScale * 1.2;
const marginHorizontal = width * 0.05;
const defaultArtwork = require('../assets/images/blank.png');


export default function LibraryScreen({ navigation }: any) {
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
    if (query.length === 0) {
      setFilteredMusicList([]);
      setQuery(query);
    } else {
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
  }

  function search({ title, artist }: { title: string, artist: string }, query: string) {
    const condition = new RegExp(`^${query}| ${query}|\\(${query}`);
    if (title.toLowerCase().match(condition) || artist.toLowerCase().match(condition)) {
      return true;
    }
    return false;
  }


  const RenderButtonToSongsScreen = () => {
    return (
      <TouchableOpacity
        onPress={() => { navigation.navigate("SongsScreen") }}
        style={{ width: width, height: width / 7, alignSelf: 'center', }}
      >
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 15, backgroundColor: 'pink', marginHorizontal: marginHorizontal }}>
          <Ionicons name='musical-note' size={scale.width * 1.5} color={colorScheme === 'light' ? Colors.dark.text : Colors.light.text} />
          <Text style={{fontSize: scale.width * 1.1}}>
            Songs
          </Text>
          <View style={{ flex: 1, backgroundColor: 'transparent', alignItems: 'flex-end', marginRight: width * 0.03 }}>
            <Ionicons name='chevron-forward-outline' size={scale.width * 1.5} color={colorScheme === 'light' ? '#d0d0d0' : '#555'} />
          </View>
        </View>

      </TouchableOpacity>
    )
  }



  const RenderInitialScreen = () => {
    return (
      <View style={{ width: width }}>
        <FlatList
          ListHeaderComponent={RenderButtonToSongsScreen}
          data={[]}
          renderItem={RenderSong}
          ListEmptyComponent={RenderNoResult}
        />
      </View>
    )
  }

  const RenderSong = ({ item }: { item: Music }) => {
    return (
      <TouchableOpacity
        onPress={() => { }}
        style={{ height: listHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}
      >
        <View>
          <Image
            source={typeof item.artwork === "number" ? defaultArtwork : { uri: item.artwork }}
            style={styles.artwork}
          />
        </View>
        <View style={{ flex: 1, marginLeft: marginBetweenAlbumartAndText }}>
          {item.artist === "" &&
            <View style={{ height: listHeight, width: width - listHeightWithoutScale * 2 - marginHorizontal, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: scale.width * 0.93 }} numberOfLines={1}>{item.title}</Text>
            </View>
          }
          {item.artist !== "" &&
            <View>
              <View style={{ height: listHeight / 2.4, width: width - listHeightWithoutScale * 2 - marginHorizontal, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: scale.width * 0.93 }} numberOfLines={1}>{item.title}</Text>
              </View>
              <View style={{ height: listHeight / 3.2, width: width - listHeightWithoutScale * 2 - marginHorizontal, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: scale.width * 0.78, color: colorScheme === "light" ? Colors.light.text2 : Colors.dark.text2, fontWeight: '300' }} numberOfLines={1}>{item.artist}</Text>
              </View>
            </View>
          }
        </View>
      </TouchableOpacity>
    )
  }

  const RenderNoResult = () => {
    return (
      <View style={{ height: height * 0.35, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <Text style={{ fontSize: scale.width * 1.2, color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
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
          <Text style={{ fontSize: scale.width * 0.95, fontWeight: '400', color: colorScheme === 'light' ? '#b7b7b7' : '#666' }}>
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
          data={filteredMusicList}
          ListEmptyComponent={RenderInitialScreen}
          ListHeaderComponent={
            <View>
              <RenderTitle title='Library' />

              <View style={{
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                height: scale.width * 2.15,
                width: width * 0.89,
                marginHorizontal: marginHorizontal,
                paddingLeft: width * 0.03,
                marginTop: scale.width * 0.5,
                marginBottom: scale.width,
                borderRadius: 11,
                backgroundColor: colorScheme === 'light' ? Colors.light.text4 : Colors.dark.text4,
              }}>
                <Ionicons name="search-outline" size={scale.width * 1.15} color={colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3} />
                <TextInput
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholder={'Songs or artists'}
                  placeholderTextColor={colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3}
                  clearButtonMode='always'
                  underlineColorAndroid='transparent'
                  value={query}
                  onChangeText={queryText => handleSearch(queryText)}
                  style={{
                    marginLeft: width * 0.02,
                    height: scale.width * 3,
                    fontSize: scale.width * 1.03,
                    width: width * 0.76,
                    color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2,
                  }}
                />
              </View>
            </View>
          }
          ItemSeparatorComponent={RenderSeparator}
          ListFooterComponent={RenderBottomMargin}
          renderItem={RenderSong}
          onScroll={(event) => {
            const scrollOffset = event.nativeEvent.contentOffset.y;

            if (scrollOffset < scale.width * 2.05) {
              if (isScrolled === true) {
                setIsScrelled(false);
              }
            } else {
              if (isScrolled === false) {
                setIsScrelled(true);
              }
            }
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          scrollEnabled={query.length !== 0 && filteredMusicList.length === 0 ? false : true}
          keyExtractor={keyExtractor}
          getItemLayout={(data, index) => (
            { length: listHeight + 1, offset: (listHeight + 1) * index, index }
          )}
        />
      </View>

      <RenderHeader title='Library' blur={isScrolled} />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  artwork: {
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
