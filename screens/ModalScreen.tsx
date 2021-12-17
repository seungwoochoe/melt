import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ImageBackground, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress, usePlaybackState, State } from 'react-native-track-player';

import Player from '../containers/Player';
import layout from '../constants/layout';
import { Track } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get("window");
const lightFilter = 'rgba(0, 0, 0, 0.35)';
const darkFilter = 'rgba(0, 0, 0, 0.5)';
const theme = 'rgba(255, 255, 255, 0.8)';
const dullTheme = 'rgba(255, 255, 255, 0.65)';
const blurRadius = 16700000 / Math.pow(height, 1.8);
const defaultArtwork = require('../assets/images/blank.png');


export default function ModalScreen({ route, navigation }: { route: { params: { initialTrack: Track, isPlaying: boolean } }, navigation: any }) {
  const track = useRef<Track>(route.params.initialTrack);
  const [isPlaying, setIsPlaying] = useState(route.params.isPlaying);
  const colorScheme = useColorScheme();
  const { position, duration } = useProgress();
  const [isSliding, setIsSliding] = useState(false);
  const slidingValue = useRef(0);
  const playbackState = usePlaybackState();
  const [trackInfo, setTrackInfo] = useState<any>({
    text: track.current,
    artwork: typeof route.params.initialTrack.artwork !== "string" ? defaultArtwork : { uri: route.params.initialTrack.artwork },
    miniArt: typeof route.params.initialTrack.miniArt !== "string" ? defaultArtwork : { uri: route.params.initialTrack.miniArt },
  });


  useEffect(() => {
    async function updateTrack() {
      const currentTrackPlayerIndex = await TrackPlayer.getCurrentTrack();
      const currentTrackPlayerTrack = Player.tracks[currentTrackPlayerIndex ?? 0];
      track.current = currentTrackPlayerTrack;
      setTrackInfo({
        text: track.current,
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

        <View style={{ flex: .8, flexDirection: 'row', alignItems: 'flex-end', marginBottom: height * 0.02 }}>
          {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name='stats-chart-outline' size={layout.ratio * 0.85} color={dullTheme} />
            <Text style={{ fontSize: layout.ratio * 0.95, color: dullTheme, fontWeight: '300', marginLeft: width * 0.02 }}>
              {Math.floor((Player.weightedMusicList.find(element => element.title === Player.playlist[Player.currentIndex].title).weight / Player.weightSum) * 10 * Player.musicList.length)}
            </Text>
          </View> */}
        </View>

        <View style={styles.artworkWrapper}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Image source={trackInfo.artwork} style={styles.arworkImage} />
          </View>
        </View>

        <View style={{ flex: 1, width: width * 0.8, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 6, paddingRight: width * 0.032 }}>
            <View style={{ height: layout.ratio * 1.5, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title} numberOfLines={1}>{trackInfo.text.title}</Text>
            </View>
            <View style={{ height: layout.ratio * 1.6, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.artist} numberOfLines={1}>{trackInfo.text.artist}</Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* <TouchableOpacity
              onPress={() => {
                Player.ToggleLike(Player.musicList.find(music => music.title === Player.playlist[Player.currentIndex].title));
                setCount(c => c + 1);
              }}
              style={{ padding: layout.width * 0.3 }}
            >
              <Ionicons
                name={Player.musicList.find(music => music.title === Player.playlist[Player.currentIndex].title).like ? "heart" : "heart-outline"}
                size={layout.ratio * 1.5}
                color={dullTheme}> 
                />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={{ flex: .3, flexDirection: 'row' }}>
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
              <Text style={{ color: '#bbb', fontSize: layout.width * 0.75 }}>
                {Math.floor(position / 60).toString()}:{Math.floor(position % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={{ color: '#bbb', fontSize: layout.width * 0.75 }}>
                -{Math.floor((duration - position) / 60).toString()}:{Math.floor((duration - position) % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>


        <View style={{ flex: 1.7, flexDirection: 'row' }}>
          <View style={styles.MusicControls}>
            <TouchableOpacity
              disabled={trackInfo.text.url === 'loading'}
              onPress={async () => { Player.skipToPrevious(position); }}
              style={{ padding: layout.width * 0.5 }}
            >
              <Ionicons name="play-back" size={layout.width * 2} color={trackInfo.text.url === 'loading' ? Colors.dark.text2 : theme} />
            </TouchableOpacity>
            <TouchableOpacity
              disabled={trackInfo.text.url === 'loading'}
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
              <Ionicons name={isPlaying ? "pause" : "play"} size={isPlaying ? layout.width * 2.8 : layout.width * 2.4} color={trackInfo.text.url === 'loading' ? Colors.dark.text2 : theme} />
            </TouchableOpacity>
            <TouchableOpacity
              disabled={trackInfo.text.url === 'loading'}
              onPress={() => { Player.skipToNext(); }}
              style={{ padding: layout.width * 0.5 }}
            >
              <Ionicons name="play-forward" size={layout.width * 2} color={trackInfo.text.url === 'loading' ? Colors.dark.text2 : theme} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  artworkWrapper: {
    height: width * 0.855,
    width: width,
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: width * 0.075,
    shadowOpacity: 0.3,
  },
  arworkImage: {
    width: width * 0.855,
    height: width * 0.855,
    borderRadius: 15,
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
  MusicControls: {
    width: width * 0.67,
    height: '65%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '18%',
    justifyContent: 'space-between',
  }
});
