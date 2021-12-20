import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ImageBackground, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress, usePlaybackState, State } from 'react-native-track-player';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Player from '../containers/Player';
import layout from '../constants/layout';
import { Track } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get("window");
const statusBarHeight = getStatusBarHeight();

const lightFilter = 'rgba(0, 0, 0, 0.4)';
const darkFilter = 'rgba(0, 0, 0, 0.5)';
const theme = 'rgba(255, 255, 255, 0.8)';
const dullTheme = 'rgba(255, 255, 255, 0.65)';

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


export default function ModalScreen({ route, navigation }: { route: { params: { initialTrack: Track, isPlaying: boolean } }, navigation: any }) {
  const track = useRef<Track>(route.params.initialTrack);
  const [isPlaying, setIsPlaying] = useState(route.params.isPlaying);
  const { position, duration } = useProgress();
  const [count, setCount] = useState(0);

  const colorScheme = useColorScheme();
  const [isSliding, setIsSliding] = useState(false);
  const slidingValue = useRef(0);

  const playbackState = usePlaybackState();
  const [trackInfo, setTrackInfo] = useState<any>({
    info: track.current,
    artwork: typeof route.params.initialTrack.artwork !== "string" ? defaultArtwork : { uri: route.params.initialTrack.artwork },
    miniArt: typeof route.params.initialTrack.miniArt !== "string" ? defaultArtwork : { uri: route.params.initialTrack.miniArt },
  });


  useEffect(() => {
    async function updateTrack() {
      const currentTrackPlayerIndex = await TrackPlayer.getCurrentTrack();
      const currentTrackPlayerTrack = Player.tracks[currentTrackPlayerIndex ?? 0];
      track.current = currentTrackPlayerTrack;
      setTrackInfo({
        info: track.current,
        artwork: typeof track.current.artwork !== "string" ? defaultArtwork : { uri: track.current.artwork },
        miniArt: typeof track.current.miniArt !== "string" ? defaultArtwork : { uri: track.current.miniArt },
      });
    }

    if (playbackState === State.Playing) {
      setIsPlaying(true);
    } else if (playbackState === State.Paused) {
      setIsPlaying(false);
    } else if (playbackState === State.Ready) {
      updateTrack();
    }
  }, [playbackState]);


  return (
    <ImageBackground
      source={trackInfo.miniArt}
      blurRadius={blurRadius}
      style={{ flex: 1, transform: [{ rotate: '180deg' }] }}
    >
      <StatusBar barStyle="light-content" animated={true} />

      <View style={{ flex: 1, transform: [{ rotate: '180deg' }], alignItems: 'center', backgroundColor: colorScheme === 'light' ? lightFilter : darkFilter }}>

        <View style={styles.artworkWrapper}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Image source={trackInfo.artwork} style={styles.arworkImage} />
          </View>
        </View>


        <View style={{ flex: .7, width: width * 0.82, flexDirection: 'row', alignItems: 'center', marginTop: width * 0.02 }}>
          <View style={{ flex: 6, paddingRight: width * 0.032 }}>
            <View style={{ height: layout.ratio * 2, flexDirection: 'row', alignItems: 'center', }}>
              <Text style={styles.title} numberOfLines={1}>{trackInfo.info.title}</Text>
            </View>

            <Text style={styles.artist} numberOfLines={1}>{trackInfo.info.artist}</Text>

          </View>
          <TouchableOpacity
            onPress={async () => {
              const targetIndex = Player.musicList.findIndex(element => element.id === track.current.id);

              if (Player.musicList[targetIndex].isLiked === false) {
                Player.musicList[targetIndex].isLiked = true;
                Player.likedSongs.unshift(Player.musicList[targetIndex]);
              } else {
                Player.musicList[targetIndex].isLiked = false;

                const likedSongsTarget = Player.likedSongs.findIndex(element => element.id === track.current.id)
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
            style={{ padding: Player.musicList.find(element => element.id === track.current.id)?.isLiked ? bottomIconsSize * 0.34 : bottomIconsSize * 0.3, }}
          >
            <Ionicons
              name={Player.musicList.find(element => element.id === track.current.id)?.isLiked ? 'heart' : 'heart-outline'}
              size={Player.musicList.find(element => element.id === track.current.id)?.isLiked ? bottomIconsSize * 0.9 : bottomIconsSize * 0.98}
              color={dullTheme}
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
              thumbTintColor='#ccc'
              minimumTrackTintColor={theme}
              maximumTrackTintColor='#aaa'
              onSlidingStart={() => { setIsSliding(true); }}
              onValueChange={(value) => { slidingValue.current = value; }}
              onSlidingComplete={async (value) => {
                await TrackPlayer.seekTo(value * duration);
                setTimeout(() => setIsSliding(false), 1000);
              }}
            />
            <View style={styles.progressLabelContainer}>
              <Text style={{ color: '#bbb', fontSize: layout.width * 0.75, fontVariant: ['tabular-nums'] }}>
                {position > 0 ? Math.floor(position / 60).toString() : '0'}:{position > 0 ? Math.floor(position % 60).toString().padStart(2, '0') : '00'}
              </Text>
              <Text style={{ color: '#bbb', fontSize: layout.width * 0.75, fontVariant: ['tabular-nums'] }}>
                -{Math.floor((duration - position) / 60).toString()}:{Math.floor((duration - position) % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>


        {(height / width) > 2 &&
          <>
            <View style={{ flex: .6, flexDirection: 'row' }}>
              <View style={{
                width: width * 0.67,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <TouchableOpacity
                  disabled={trackInfo.info.url === 'loading'}
                  onPress={async () => { Player.skipToPrevious(position); }}
                  style={{ padding: layout.width * 0.5 }}
                >
                  <Ionicons name="play-back" size={layout.width * 2} color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme} />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={trackInfo.info.url === 'loading'}
                  onPress={async () => {
                    if (isPlaying) {
                      await Player.pause();
                      setIsPlaying(false);
                    } else {
                      await Player.play();
                      setIsPlaying(true);
                    }
                  }}
                  style={{ padding: isPlaying ? layout.width * 0.2 : layout.width * 0.4 }}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={isPlaying ? layout.width * 2.8 : layout.width * 2.4}
                    color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme}
                    style={{ marginLeft: isPlaying ? 0 : layout.width * 0.2 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={trackInfo.info.url === 'loading'}
                  onPress={() => { Player.skipToNext(); }}
                  style={{ padding: layout.width * 0.5 }}
                >
                  <Ionicons name="play-forward" size={layout.width * 2} color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme} />
                </TouchableOpacity>
              </View>
            </View>


            <View style={{ flex: .7, width: width, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingBottom: layout.height * 1.4, }}>
              <TouchableOpacity
                onPress={() => { }}
                style={{ width: width * 0.3, }}
              >
                <View style={{ alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', margin: layout.width * 0.7 }}>
                    <Ionicons name='repeat-outline' size={bottomIconsSize} color={dullTheme} />
                    <Text style={{ fontSize: layout.width * 0.9, color: dullTheme, marginLeft: layout.width * 0.3 }}>
                      Repeat
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { }}
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
          <View style={{ flex: .7, flexDirection: 'row', marginBottom: height * 0.085 }}>
            <View style={{
              width: width * 0.92,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <TouchableOpacity
                onPress={() => { }}
                style={{ padding: layout.width * 0.6, }}
              >
                <Ionicons name='repeat-outline' size={bottomIconsSize * 0.95} color={dullTheme} />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={trackInfo.info.url === 'loading'}
                onPress={async () => { Player.skipToPrevious(position); }}
                style={{ padding: layout.width * 0.5 }}
              >
                <Ionicons name="play-back" size={layout.width * 2} color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme} />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={trackInfo.info.url === 'loading'}
                onPress={async () => {
                  if (isPlaying) {
                    await Player.pause();
                    setIsPlaying(false);
                  } else {
                    await Player.play();
                    setIsPlaying(true);
                  }
                }}
                style={{ padding: isPlaying ? layout.width * 0.2 : layout.width * 0.4 }}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={isPlaying ? layout.width * 2.8 : layout.width * 2.4}
                  color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme}
                  style={{ marginLeft: isPlaying ? 0 : layout.width * 0 }}
                />
              </TouchableOpacity>

              <TouchableOpacity
                disabled={trackInfo.info.url === 'loading'}
                onPress={() => { Player.skipToNext(); }}
                style={{ padding: layout.width * 0.5, }}
              >
                <Ionicons name="play-forward" size={layout.width * 2} color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { }}
                style={{ padding: layout.width * 0.6, }}
              >
                <Ionicons name='chatbox-ellipses-outline' size={bottomIconsSize * 0.85} color={dullTheme} style={{ marginRight: layout.width * 0.15 }} />

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
  arworkImage: {
    width: width * 0.855,
    height: width * 0.855,
    borderRadius: width / 32,
  },
  title: {
    fontSize: layout.width * 1.35,
    color: theme,
    fontWeight: '600',
  },
  artist: {
    fontSize: layout.width * 1.1,
    color: dullTheme,
    fontWeight: '300',
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
