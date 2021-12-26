import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';

import Player from '../containers/Player';
import { readMusicFiles, pruneStoredTracks, getStoredHistoryList, getStoredMusicSelection, getStoredLikedSongs } from '../containers/Reader';
import { complementTracks } from '../containers/Creater';


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

        Player.musicList = await readMusicFiles();
        Player.historyList = await getStoredHistoryList();
        Player.musicSelection = await getStoredMusicSelection();
        Player.likedSongs = await getStoredLikedSongs();

        if (Player.musicList.length === 0) {
          // No music!
        }
        else {
          if (Player.musicList.length > 1) {
            const storedTracks = await pruneStoredTracks();

            let isAllSongsFromTracksExist = true;

            for (const track of storedTracks) {
              if (Player.musicList.findIndex(element => element.id === track.id) === -1) {
                isAllSongsFromTracksExist = false;
                break;
              }
            }

            if (isAllSongsFromTracksExist) {
              if (storedTracks.length === 0) {
                Player.tracks = complementTracks([{ ...Player.musicList[0], isPlayed: false, isTrigger: false }], Player.musicList);
              }
              else {
                Player.tracks = complementTracks(storedTracks, Player.musicList);
              }
            }
            else {
              Player.tracks = complementTracks([], Player.musicList);
            }
          }
          else {
            Player.tracks = [{ ...Player.musicList[0], isPlayed: false, isTrigger: false }];
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
