import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Player from './containers/Player';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { readMusicFiles } from './containers/Reader';


export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  
  React.useEffect(() => {
    async function initialize() {
      const musicList = await readMusicFiles();
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
