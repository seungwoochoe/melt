import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import cloneDeep from 'lodash.clonedeep';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Player from '../containers/Player';
import { readMusicFiles, pruneStoredTracks, getStoredHistoryList, getStoredMusicSelection, getStoredLikedSongs } from '../containers/Reader';
import { complementTracks, weightMusicList } from '../containers/Creater';


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

        const updatedMusicList = await readMusicFiles();
        Player.historyList = await getStoredHistoryList();
        Player.musicList = await weightMusicList(cloneDeep(updatedMusicList), Player.historyList);
        Player.musicSelection = await getStoredMusicSelection();
        Player.likedSongs = await getStoredLikedSongs();
        Player.updateTopMusic();
        try {
          Player.updateSongsForHomeScreen();

					const jsonValue = JSON.stringify(Date.now());
					await AsyncStorage.setItem('lastHomeUpdateTime', jsonValue);
				} catch (e) {
					// console.warn(e);
				}

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
                Player.tracks = await complementTracks([{
                  url: Player.musicList[0].url,
                  title: Player.musicList[0].title,
                  artist: Player.musicList[0].artist,
                  artwork: Player.musicList[0].artwork,
                  id: Player.musicList[0].id,
                  isPlayed: false,
                  isTrigger: false,
                }], cloneDeep(Player.musicList));
              }
              else {
                Player.tracks = await complementTracks(storedTracks, cloneDeep(Player.musicList));
              }
            }
            else {
              Player.tracks = await complementTracks([], cloneDeep(Player.musicList));
            }
          }
          else {
            Player.tracks = [{
              url: Player.musicList[0].url,
              title: Player.musicList[0].title,
              artist: Player.musicList[0].artist,
              artwork: Player.musicList[0].artwork,
              id: Player.musicList[0].id,
              isPlayed: false,
              isTrigger: false,
            }];
          }

          Player.tracks = Player.tracks.slice(0, 4);
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
