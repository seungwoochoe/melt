import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ImageBackground, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress, usePlaybackState, State, RepeatMode } from 'react-native-track-player';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import LinearGradient from 'react-native-linear-gradient';
import TextTicker from 'react-native-text-ticker';
import { Easing } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';

import Player from '../containers/Player';
import layout from '../constants/layout';
import { Music } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get("window");
const statusBarHeight = getStatusBarHeight();

const lightFilter = 'rgba(0, 0, 0, 0.35)';
const darkFilter = 'rgba(0, 0, 0, 0.4)';
const theme = 'rgba(255, 255, 255, 0.8)';
const dullTheme = 'rgba(255, 255, 255, 0.65)';
const progressBarDullTheme = 'rgba(255, 255, 255, 0.25)';

// const blurRadius = 16700000 / Math.pow(height, 1.8);
let blurRadius = 0;
if ((height / width) > 2) {
  blurRadius = 180;
}
else {
  blurRadius = 120;
}

const defaultArtwork = require('../assets/images/blank.png');

const bottomIconsSize = layout.width * 1.6;

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};


export default function ModalScreen({ route, navigation }: { route: { params: { id: string, isPlaying: boolean, isRepeat: boolean } }, navigation: any }) {
  const [currentMusic, setCurrentMusic] = useState<Music>(Player.musicList.find(elemnet => elemnet.id === route.params.id) ?? Player.defaultMusic);
  const [isPlaying, setIsPlaying] = useState(route.params.isPlaying);
  const { position, duration } = useProgress();
  const [count, setCount] = useState(0);

  const isRepeat = useRef(route.params.isRepeat);

  const colorScheme = useColorScheme();
  const [isSliding, setIsSliding] = useState(false);
  const slidingValue = useRef(0);

  const playbackState = usePlaybackState();


  useEffect(() => {
    async function updateTrack() {
      const currentTrackPlayerIndex = await TrackPlayer.getCurrentTrack();
      setCurrentMusic(Player.musicList.find(element => element.id === Player.tracks[currentTrackPlayerIndex].id) ?? Player.defaultMusic);
    }

    if (playbackState === State.Playing) {
      setIsPlaying(true);
    } else if (playbackState === State.Paused) {
      setIsPlaying(false);
    } else if (playbackState === State.Ready) {
      updateTrack();
    }
  }, [playbackState]);



  const handlePlayPauseButton = async () => {
    if (isPlaying) {
      await Player.pause();
      setIsPlaying(false);
    } else {
      await Player.play();
      setIsPlaying(true);
    }
  }

  const handleShuffleRepeatButton = async () => {
    ReactNativeHapticFeedback.trigger("rigid");

    if (isRepeat.current) {
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
      isRepeat.current = false;
    }
    else {
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
      isRepeat.current = true;
    }

    setCount(c => c + 1);

    try {
      const jsonValue = JSON.stringify(isRepeat.current);
      await AsyncStorage.setItem('isRepeat', jsonValue);
    } catch (e) {
      // console.log(e);
    }
  }


  return (
    <ImageBackground
      source={typeof currentMusic.miniArt !== "string" ? defaultArtwork : { uri: currentMusic.miniArt }}
      blurRadius={blurRadius}
      style={{ flex: 1, transform: [{ rotate: '180deg' }] }}
    >
      <StatusBar barStyle="light-content" animated={true} />

      <View style={{ flex: 1, transform: [{ rotate: '180deg' }], alignItems: 'center', backgroundColor: colorScheme === 'light' ? lightFilter : darkFilter }}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .15)']}
          locations={[0, 1]}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
        />

        <View style={styles.artworkWrapper}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Image source={typeof currentMusic.artwork !== "string" ? defaultArtwork : { uri: currentMusic.artwork }} style={{
              width: width * 0.855,
              height: width * 0.855,
              borderRadius: width / 32,
            }} />
          </View>
        </View>


        <View style={{ flex: .7, width: width, flexDirection: 'row', alignItems: 'center', marginTop: width * 0.02, }}>
          <MaskedView
            style={{ flex: 6 }}
            maskElement={
              <LinearGradient
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={['transparent', 'black', 'black', 'transparent']}
                locations={[0.09, 0.12, .94, .97]}
              />}
          >
            <View style={{ height: layout.ratio * 2, flexDirection: 'row', alignItems: 'center', }}>
              <TextTicker
                style={{
                  fontSize: layout.width * 1.27,
                  color: theme,
                  fontWeight: '600',
                  paddingLeft: width * 0.09,
                }}
                scrollSpeed={50}
                bounce={false}
                marqueeDelay={3000}
                scroll={false}
                easing={Easing.linear}
              >
                {currentMusic.title}
              </TextTicker>
            </View>

            <TextTicker
              style={{
                fontSize: layout.width * 1.1,
                color: dullTheme,
                fontWeight: '300',
                paddingLeft: width * 0.09,
              }}
              scrollSpeed={55}
              bounce={false}
              marqueeDelay={3000}
              scroll={false}
              easing={Easing.linear}
            >
              {currentMusic.artist}
            </TextTicker>
          </MaskedView>

          <TouchableOpacity
            style={{ width: width * 0.2, alignItems: 'center', marginRight: width * 0.035, padding: Player.musicList.find(element => element.id === currentMusic.id)?.isLiked ? bottomIconsSize * 0.34 : bottomIconsSize * 0.3, }}
            onPress={async () => {

              const targetIndex = Player.musicList.findIndex(element => element.id === currentMusic.id);

              if (Player.musicList[targetIndex].isLiked === false) {
                ReactNativeHapticFeedback.trigger("notificationSuccess", hapticOptions);
                Player.musicList[targetIndex].isLiked = true;
                Player.likedSongs.unshift(Player.musicList[targetIndex]);
              } else {
                ReactNativeHapticFeedback.trigger("rigid", hapticOptions);
                Player.musicList[targetIndex].isLiked = false;

                const likedSongsTarget = Player.likedSongs.findIndex(element => element.id === currentMusic.id)
                Player.likedSongs.splice(likedSongsTarget, 1);
              }

              setCount(c => c + 1);

              try {
                const jsonValue = JSON.stringify(Player.musicList);
                await AsyncStorage.setItem('musicList', jsonValue);
              } catch (e) {
                // console.log(e);
              }

              try {
                const jsonValue = JSON.stringify(Player.likedSongs);
                await AsyncStorage.setItem('likedSongs', jsonValue);
              } catch (e) {
                // console.log(e);
              }
            }}
          >
            <Ionicons
              name={Player.musicList.find(element => element.id === currentMusic.id)?.isLiked ? 'heart' : 'heart-outline'}
              size={Player.musicList.find(element => element.id === currentMusic.id)?.isLiked ? bottomIconsSize * 0.85 : bottomIconsSize * 0.98}
              color={'rgba(255, 255, 255, 0.67)'}
            />
          </TouchableOpacity>
        </View>


        <View style={{ flex: .5, flexDirection: 'row' }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Slider
              style={styles.progressContainer}
              value={isSliding === true ? slidingValue.current : (duration === 0 ? 0 : (position / duration))}
              minimumValue={0}
              maximumValue={1}
              thumbTintColor='#d2d2d2'
              minimumTrackTintColor={dullTheme}
              maximumTrackTintColor={progressBarDullTheme}
              onSlidingStart={() => { setIsSliding(true); }}
              onValueChange={(value) => { slidingValue.current = value; }}
              onSlidingComplete={async (value) => {
                await TrackPlayer.seekTo(value * duration);
                setTimeout(() => setIsSliding(false), 1000);
              }}
            />
            <View style={styles.progressLabelContainer}>
              <Text style={{ color: dullTheme, fontSize: layout.width * 0.75, fontVariant: ['tabular-nums'] }}>
                {position > 0 ? Math.floor(position / 60).toString() : '0'}:{position > 0 ? Math.floor(position % 60).toString().padStart(2, '0') : '00'}
              </Text>
              <Text style={{ color: dullTheme, fontSize: layout.width * 0.75, fontVariant: ['tabular-nums'] }}>
                -{Math.floor((duration - position) / 60).toString()}:{Math.floor((duration - position) % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>


        {(height / width) > 2 && // For iPhone X and above.
          <>
            <View style={{ flex: .6, flexDirection: 'row' }}>
              <View style={{
                width: width * 0.67,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <TouchableOpacity
                  disabled={currentMusic.url === 'loading'}
                  onPress={async () => { await Player.skipToPrevious(position); }}
                  style={{ padding: layout.width * 0.5, }}
                >
                  <Ionicons name="play-back" size={layout.width * 2} color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme} />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={currentMusic.url === 'loading'}
                  onPress={async () => { handlePlayPauseButton(); }}
                  style={{ padding: isPlaying ? layout.width * 0.2 : layout.width * 0.4 }}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={isPlaying ? layout.width * 2.8 : layout.width * 2.4}
                    color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme}
                    style={{ marginLeft: isPlaying ? 0 : layout.width * 0.2 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={currentMusic.url === 'loading'}
                  onPress={() => { Player.skipToNext(); }}
                  style={{ padding: layout.width * 0.5 }}
                >
                  <Ionicons name="play-forward" size={layout.width * 2} color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme} />
                </TouchableOpacity>
              </View>
            </View>


            <View style={{ flex: .7, width: width, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: layout.height * 1.4, }}>
              <TouchableOpacity
                onPress={async () => { handleShuffleRepeatButton(); }}
                style={{ width: width * 0.3, }}
              >
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', margin: layout.width * 0.7 }}>
                    <Ionicons name={isRepeat.current ? 'reload-outline' : 'shuffle-outline'} size={isRepeat.current ? bottomIconsSize * 0.8 : bottomIconsSize} color={dullTheme} />
                    <Text style={{ fontSize: layout.width * 0.9, color: dullTheme, marginLeft: layout.width * 0.3 }}>
                      {isRepeat.current ? 'Repeat' : 'Shuffle'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  navigation.navigate('LyricsScreen', { id: currentMusic.id, isPlaying: isPlaying, });
                }}
                style={{ width: width * 0.3 }}
              >
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', margin: layout.width * 0.7 }}>
                    <Ionicons name='chatbox-ellipses-outline' size={bottomIconsSize * 0.9} color={dullTheme} style={{ marginRight: layout.width * 0.15 }} />
                    <Text style={{ fontSize: layout.width * 0.9, color: dullTheme, marginLeft: layout.width * 0.3 }}>
                      Lyrics
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </>
        }


        {(height / width) <= 2 &&
          <View style={{ flex: .7, flexDirection: 'row', marginBottom: height * 0.07 }}>
            <View style={{
              width: width,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <TouchableOpacity
                onPress={async () => { handleShuffleRepeatButton(); }}
                style={{ flex: 1, paddingVertical: layout.width, alignItems: 'center' }}
              >
                <Ionicons
                  name={isRepeat.current ? 'reload-outline' : 'shuffle-outline'}
                  size={isRepeat.current ? bottomIconsSize * 0.8 : bottomIconsSize}
                  color={dullTheme}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={currentMusic.url === 'loading'}
                onPress={async () => { Player.skipToPrevious(position); }}
                style={{ flex: 1, paddingVertical: layout.width, alignItems: 'center' }}
              >
                <Ionicons name="play-back" size={layout.width * 2} color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme} />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={currentMusic.url === 'loading'}
                onPress={async () => { handlePlayPauseButton(); }}
                style={{ flex: 1, paddingVertical: layout.width, alignItems: 'center' }}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={isPlaying ? layout.width * 2.8 : layout.width * 2.4}
                  color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme}
                  style={{ marginLeft: isPlaying ? 0 : layout.width * .2, paddingBottom: isPlaying ? layout.width * 3.1 : 0 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={currentMusic.url === 'loading'}
                onPress={() => { Player.skipToNext(); }}
                style={{ flex: 1, paddingVertical: layout.width, alignItems: 'center' }}
              >
                <Ionicons name="play-forward" size={layout.width * 2} color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('LyricsScreen', { id: currentMusic?.id, isPlaying: isPlaying, });
                }}
                style={{ flex: 1, paddingVertical: layout.width, alignItems: 'center' }}
              >
                <Ionicons name='chatbox-ellipses-outline' size={bottomIconsSize * 0.87} color={dullTheme} style={{ marginRight: layout.width * 0.15 }} />

              </TouchableOpacity>
            </View>
          </View>
        }


      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  artworkWrapper: {
    marginTop: statusBarHeight + height * 0.07,
    height: width * 0.855,
    width: width,
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: width * 0.075,
    shadowOpacity: 0.3,
    // backgroundColor: 'pink',
  },
  progressContainer: {
    width: width * 0.82,
    alignItems: 'center',
  },
  progressLabelContainer: {
    width: width * 0.82,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
