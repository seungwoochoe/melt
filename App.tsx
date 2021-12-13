import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Player from './containers/Player';
import * as RNFS from 'react-native-fs';
import * as jsmediatags from 'jsmediatags'
import base64 from 'react-native-base64';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';


function readMetadata(file: any) {
  return new Promise((resolve, reject) => {
    new jsmediatags.Reader(file.path)
      .read({
        onSuccess: (metadata: any) => {
          resolve(metadata);
        },
        onError: (e: any) => {
          reject(e);
        }
      });
  });
}

function generatePictureData(metadata: any) {
  const data = metadata.tags.picture.data;
  let base64String = "";
  for (let i = 0; i < data.length; i++) {
    base64String += String.fromCharCode(data[i]);
  }
  return ({ uri: `data:${data.format};base64,${base64.encode(base64String)}` });
}


export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  React.useEffect(() => {
    async function initialize() {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      for (const file of files) {
        const metadata: any = await readMetadata(file);
        const pictureData = generatePictureData(metadata);

        Player.musicList.push({
          url: file.path,
          title: metadata.tags.title,
          artist: metadata.tags.artist,
          artwork: pictureData,
          // artwork: require('./assets/images/blank.png'),
          id: file.path,
        })
        console.log("added track");
      };
      await Player.setupPlayer();
      console.log("player set up.");
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
