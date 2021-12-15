import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Player from './containers/Player';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { readMusicFiles, getStoredTracks } from './containers/Reader';


const { width } = Dimensions.get('screen');
const artworkSize = Math.floor(width * 1.8);
const miniArtSize = width * 0.24;

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();


  React.useEffect(() => {
    async function initialize() {
      const musicList = await readMusicFiles(artworkSize, miniArtSize);
      const storedTracks = await getStoredTracks();
      Player.musicList = musicList;
      await Player.setupPlayer();
    }
    initialize();
  }, []);


  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    Player.currentIndex = await TrackPlayer.getCurrentTrack();
  })
  

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}
