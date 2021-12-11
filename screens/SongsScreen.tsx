import * as React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, StatusBar, Animated, Platform, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import filter from 'lodash.filter';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import { Music, Track } from '../types';

import Player from '../containers/Player';
import { RootTabScreenProps } from '../types';
import musicList from '../assets/data';

const { width, height } = Dimensions.get("screen");
const listHeight = width * 0.149;
const marginBetweenAlbumartAndText = width * 0.029;
const statusBarHeight = listHeight * 1.2;
const headerHeight = 44 + getStatusBarHeight();

let blurIntensity: number;
if (Platform.OS === 'ios') {
  blurIntensity = 97;
} else {
  blurIntensity = 200;
}

export default function SongsScreen({ navigation }: RootTabScreenProps<'Songs'>) {
  const [isBusy, setIsBusy] = React.useState(false);
  const isScrolled = React.useRef(false);
  const [count, setCount] = React.useState(0);
  const [query, setQuery] = React.useState('');
  const [filteredMusicList, setFilteredMusicList] = React.useState([]);
  const colorScheme = useColorScheme();

  function handleSearch(query: string) {
    const formattedQuery = query.toLowerCase();
    const filteredData = filter(musicList, music => {
      return search(music, formattedQuery);
    })

    setFilteredMusicList(filteredData);
    setQuery(query);
  }

  function search({ title, artist }: { title: string, artist: string }, query: string) {
    if (title.toLowerCase().includes(query) || artist.toLowerCase().includes(query)) {
      return true;
    } else {
      return false;
    }
  }

  const RenderHeaderBarPlaceholderConditionally = () => {
    if (!isScrolled.current) {
      return (
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 1,
          height: headerHeight,
          backgroundColor: colorScheme === 'light' ? Colors.light.background : Colors.dark.background,
        }} />
      );
    } else {
      return null;
    }
  }

  const RenderTitle = () => {
    return (
      <View style={{ height: scale.ratio * 5, width: width, marginTop: headerHeight }}>
        <Text style={{ fontSize: scale.width * 1.9, fontWeight: 'bold', marginLeft: width * 0.06, paddingTop: scale.ratio * 0.3 }}>
          Songs
        </Text>
      </View>
    )
  }

  const RenderSearchBar = () => {
    return (
      <View>

      </View>
    )
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
          <View style={{ height: listHeight / 2.4, width: width - listHeight * 2 - width * 0.05, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: scale.width * 0.93 }} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={{ height: listHeight / 3.2, width: width - listHeight * 2 - width * 0.05, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: scale.width * 0.78, color: colorScheme === "light" ? Colors.light.text2 : Colors.dark.text2, fontWeight: '300' }} numberOfLines={1}>{item.artist}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const RenderNoResult = () => {
    return (
      <View style={{ height: height * 0.35, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <Text style={{ fontSize: scale.width * 1.2 }}>
          No results
        </Text>
      </View>
    )
  }

  const RenderSongForBottomBar = ({ item }: { item: Track }) => {
    return (
      <TouchableOpacity
        onPress={() => { }}
        style={{ height: statusBarHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: listHeight,
          shadowColor: 'black',
          shadowRadius: width * 0.02,
          shadowOpacity: 0.25,
          shadowOffset: { width: -statusBarHeight * 0.02, height: statusBarHeight * 0.003 },
          backgroundColor: 'transparent',
        }}>
          <Image
            source={item.artwork}
            style={styles.artwork}
          />
        </View>
        <View style={{ width: width - listHeight * 2 - width * 0.22, marginLeft: marginBetweenAlbumartAndText, backgroundColor: 'transparent', }}>
          <Text style={{ fontSize: scale.width, }} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const RenderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          marginLeft: listHeight + marginBetweenAlbumartAndText + width * 0.045,
          marginRight: width * 0.06,
        }}
        lightColor='#dfdfdf'
        darkColor='#343434'
      />
    )
  }

  const RenderMusicCount = () => {
    return (
      <View style={{ height: statusBarHeight * 1.04, alignItems: 'center', paddingTop: statusBarHeight * 0.1 }}>
        <Text style={{ fontSize: scale.width * 0.95, fontWeight: '400', color: colorScheme === 'light' ? '#b7b7b7' : '#666' }}>
          {/* - {Player.musicList.length} songs - */}
        </Text>
      </View>
    )
  }


  return (
    <View style={styles.container}>
      <StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

      <RenderHeaderBarPlaceholderConditionally />

      <View style={{ flex: 1, alignItems: 'center' }}>
        <Animated.FlatList
          style={{}}
          data={query.length === 0 ? Player.musicList : filteredMusicList}
          ListEmptyComponent={<RenderNoResult />}
          ListHeaderComponent={
            <View>
              <RenderTitle />
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: scale.width * 2.2,
                width: width * 0.9,
                marginHorizontal: width * 0.05,
                paddingHorizontal: width * 0.03,
                marginBottom: scale.width,
                borderRadius: 10,
                backgroundColor: colorScheme === 'light' ? Colors.light.text4 : Colors.dark.text4,
              }}>
                <Ionicons name="search-outline" size={scale.width * 1.1} color={colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3} />
                <TextInput
                  autoCapitalize='none'
                  autoCorrect={false}
                  placeholder={'Search'}
                  placeholderTextColor={colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3}
                  clearButtonMode='always'
                  value={query}
                  onChangeText={queryText => handleSearch(queryText)}
                  style={{ 
                    marginLeft: width * 0.02,
                    height: scale.width * 3,
                    fontSize: scale.width * 1.1,
                    width: width * 0.78,
                    // backgroundColor: 'pink',
                  }}
                />
              </View>
            </View>
          }
          ItemSeparatorComponent={RenderSeparator}
          ListFooterComponent={RenderMusicCount}
          renderItem={RenderSong}
          onScroll={(event) => {
            const scrollOffset = event.nativeEvent.contentOffset.y;
            if (scrollOffset < scale.width * 2.05) {
              if (isScrolled.current === true) {
                navigation.setOptions({
                  headerTitle: "",
                  headerShown: false,
                });
                isScrolled.current = false;
                setCount(c => c + 1);
              }
            } else {
              if (isScrolled.current === false) {
                navigation.setOptions({
                  headerTitle: "Songs",
                  headerShown: true,
                });
                isScrolled.current = true;
                setCount(c => c + 1);
              }
            }
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}

        />
      </View>

      <BlurView intensity={blurIntensity} tint={colorScheme === 'light' ? 'light' : 'dark'} style={styles.bottomBarContainer}>
        <View style={{ flex: 13, backgroundColor: 'transparent' }}>
          <RenderSongForBottomBar item={Player.playlist == null ? Player.musicList[0] : Player.playlist[Player.currentIndex]} />
        </View>
        <View style={{ flex: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
          <TouchableOpacity
            disabled={isBusy}
            onPress={async () => {
              // if (Player.isPlaying) {
              //   await Player.pause();
              //   setCount(c => c + 1);
              // } else {
              //   await Player.play();
              //   setCount(c => c + 1);
              // }
            }}
            style={{ padding: Player.isPlaying ? scale.width * 0.6 : scale.width * 0.775 }}
          >
            <Ionicons name={Player.isPlaying ? "pause" : "play"} size={Player.isPlaying ? scale.width * 2 : scale.width * 1.65} color={colorScheme === "light" ? Colors.light.text : Colors.dark.text}></Ionicons>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!isBusy}
            onPress={async () => {
              // setIsAvailable(false);
              // await Player.skipToNext();
              // setIsAvailable(true);
            }}
            style={{ padding: scale.width * 0.53, marginRight: width * 0.05 }}
          >
            <Ionicons name="play-forward" size={scale.width * 1.75} color={colorScheme === "light" ? Colors.light.text : Colors.dark.text}></Ionicons>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  artwork: {
    width: listHeight * 0.9,
    height: listHeight * 0.9,
    margin: listHeight * 0.05,
    borderRadius: 4.5,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  bottomBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: statusBarHeight,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomMusic: {
    alignItems: 'center',
    height: listHeight,
    flexDirection: 'row',
    paddingLeft: width * 0.05,
  }
});
