import * as React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform, TextInput, SectionList, KeyboardAvoidingView, Keyboard, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import filter from 'lodash.filter';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import { Music, Track } from '../types';
import RenderHeader from '../components/Header';
import RenderTitle from '../components/Title';
import RenderBottomBar from '../components/BottomBar';

import Player from '../containers/Player';
import { RootTabScreenProps } from '../types';
import musicList from '../assets/data';

const { width, height } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.149;


export default function SongsScreen({ navigation }: RootTabScreenProps<'Songs'>) {
  const [isBusy, setIsBusy] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [filteredMusicList, setFilteredMusicList] = React.useState<Music[]>([]);
  const [isKeyboardShown, setIsKeyboardShown] = React.useState(false);
  const [isScrolled, setIsScrelled] = React.useState(false);
  const [count, setCount] = React.useState(0);

  const colorScheme = useColorScheme();
  const listHeight = width * 0.149 * useWindowDimensions().fontScale;
  const bottomBarHeight = listHeight * 1.2;


  React.useEffect(() => {
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
    const filteredData = filter(musicList, music => {
      return search(music, query.toLowerCase());
    })
    setFilteredMusicList(filteredData);
    setQuery(query);
  }

  function search({ title, artist }: { title: string, artist: string }, query: string) {
    const condition = new RegExp(`^${query}| ${query}`);
    if (title.toLowerCase().match(condition) || artist.toLowerCase().match(condition)) {
      return true;
    }
    return false;
  }


  const RenderSong = ({ item }: { item: Music }) => {
    return (
      <TouchableOpacity
        disabled={isBusy}
        onPress={() => { }}
        style={{ height: listHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}
      >
        <View>
          <Image
            source={item.artwork}
            style={styles.artwork}
          />
        </View>
        <View style={{ flex: 1, marginLeft: marginBetweenAlbumartAndText }}>
          <View style={{ height: listHeight / 2.4, width: width - listHeightWithoutScale * 2 - width * 0.05, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: scale.width * 0.93 }} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={{ height: listHeight / 3.2, width: width - listHeightWithoutScale * 2 - width * 0.05, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: scale.width * 0.78, color: colorScheme === "light" ? Colors.light.text2 : Colors.dark.text2, fontWeight: '300' }} numberOfLines={1}>{item.artist}</Text>
          </View>
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
        {(query.length === 0 || filteredMusicList.length !== 0) &&
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
          data={query.length === 0 ? Player.musicList : filteredMusicList}
          ListEmptyComponent={<RenderNoResult />}
          // stickyHeaderIndices={[0]}
          ListHeaderComponent={
            <View>
              <RenderTitle title='Songs' />

              <View style={{
                alignSelf: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                height: scale.width * 2.15,
                width: width * 0.89,
                marginHorizontal: width * 0.05,
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
                  placeholder={'Search'}
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
          keyboardShouldPersistTaps='always'
          scrollEnabled={query.length !== 0 && filteredMusicList.length === 0 ? false : true}
          keyExtractor={(item) => item.id}
        />
      </View>

      <RenderHeader title='Songs' blur={isScrolled} />

      <RenderBottomBar />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  artwork: {
    width: listHeightWithoutScale * 0.9,
    height: listHeightWithoutScale * 0.9,
    margin: listHeightWithoutScale * 0.05,
    borderRadius: 4.5,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
