import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Dimensions } from 'react-native';

import Player from '../containers/Player';
import { readMusicFiles, pruneStoredTracks, getStoredHistories, getStoredMusicSelection } from '../containers/Reader';
import { initializeWeights, complementTracks } from '../containers/Creater';

const { width } = Dimensions.get('screen');
const artworkSize = Math.floor(width * 1.8);
const miniArtSize = width * 0.26;


export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load fonts
        await Font.loadAsync({
          ...FontAwesome.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });

        Player.musicList = await readMusicFiles(artworkSize, miniArtSize);
        Player.histories = await getStoredHistories();
        Player.musicSelection = await getStoredMusicSelection();
        Player.weightedMusicList = initializeWeights(Player.musicList);

        if (Player.musicList.length === 0) {
          // No music!
        }
        else {
          if (Player.musicList.length > 1) {
            const storedTracks = await pruneStoredTracks();
            Player.tracks = complementTracks(storedTracks, Player.weightedMusicList);
          } else {
            Player.tracks = [{ ...Player.musicList[0], isPlayed: false, isTrigger: true }];
          }

          await Player.setupPlayer();
        }

      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
