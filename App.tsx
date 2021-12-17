import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Player from './containers/Player';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { readMusicFiles, pruneStoredTracks } from './containers/Reader';
import { initializeWeights, complementTracks } from './containers/Creater';


const { width } = Dimensions.get('screen');
const artworkSize = Math.floor(width * 1.8);
const miniArtSize = width * 0.26;

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();


  React.useEffect(() => {
    async function initialize() {
      Player.musicList = await readMusicFiles(artworkSize, miniArtSize);
      Player.weightedMusicList = initializeWeights(Player.musicList);

      if (Player.weightedMusicList.length === 0) {
        // No music!
      } else {
        if (Player.weightedMusicList.length > 1) {
          const storedTracks = await pruneStoredTracks();
          Player.tracks = complementTracks(storedTracks, Player.weightedMusicList);
        } else {
          Player.tracks = [{ ...Player.musicList[0], isPlayed: false, isTrigger: true }];
        }

        await Player.setupPlayer();
      }
    }
    initialize();
  }, []);


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
