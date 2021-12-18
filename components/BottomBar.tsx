import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer, { Event, useTrackPlayerEvents, usePlaybackState, State, useProgress } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Track } from '../types';

import Player from '../containers/Player';

const { width, height } = Dimensions.get('screen');
const listHeight = width * 0.16;
const marginBetweenAlbumartAndText = width * 0.029;
const bottomBarHeight = listHeight * 1.12;
const defaultMiniArt = require('../assets/images/blank.png');
const blankTrack: Track = { url: 'loading', title: 'processing files...', artist: '', artwork: defaultMiniArt, miniArt: defaultMiniArt, id: 'blankTrack', isPlayed: false, isTrigger: false };

let blurIntensity: number;
if (Platform.OS === 'ios') {
	blurIntensity = 97;
} 
else {
	blurIntensity = 200;
}

let tabBarHeight: number;
if ((height / width) > 2) {
	tabBarHeight = height * 0.0935;
}
else {
	tabBarHeight = height * 0.0731;
}

export default function RenderBottomBar() {
	const [trackInfo, setTrackInfo] = useState<Track>(blankTrack);
	const [isPlaying, setIsPlaying] = useState(false);
	
	const savedPosition = useRef(0);

	const colorScheme = useColorScheme();
	const playbackState = usePlaybackState();
	const { position, duration } = useProgress();
	
	const navigation = useNavigation<any>();


	useEffect(() => {
		async function getSavedPosition() {
			try {
				const jsonValue = await AsyncStorage.getItem('savedPosition');
				savedPosition.current = jsonValue != null ? Number(JSON.parse(jsonValue)) : 0;
			} catch (e) {
				// console.log(e);
			}

			await TrackPlayer.seekTo(savedPosition.current);
		}
		getSavedPosition();
	}, []);


	useEffect(() => {
		if (playbackState === State.Playing) {
			setIsPlaying(true);
		}
		else if (playbackState === State.Paused) {
			setIsPlaying(false)
		}
		else if (playbackState === State.Ready) {
			setTimeout(() => { // Is it okay to code like this..? useTrackPlayerEvents belew is a bit slower I guess, and because of that, I have to wait for Player.handlePlayNext(); to be fired.
				setTrackInfo(Player.tracks[Player.currentIndex]);
				Player.storeTracks();
			}, 70);
		}
	}, [playbackState]);


	useTrackPlayerEvents([Event.RemoteSeek, Event.PlaybackTrackChanged], async event => {
		if (event.type === Event.PlaybackTrackChanged) {
			Player.currentDuration = duration === 0 ? 1000 : duration;

			if (event.position > duration * 0.99) {
				Player.handlePlayNext();
			}
		}
		else if (event.type === Event.RemoteSeek) {
			await TrackPlayer.seekTo(event.position);
			await TrackPlayer.pause();
			await TrackPlayer.play();
		}
	});


	useEffect(() => {
		async function savePosition() {
			savedPosition.current = position;

			try {
				const jsonValue = JSON.stringify(savedPosition.current);
				await AsyncStorage.setItem('savedPosition', jsonValue);
			} catch (e) {
				// console.log(e);
			}
		}
		savePosition();
	});



	return (
		<BlurView
			intensity={blurIntensity}
			tint={colorScheme === 'light' ? 'light' : 'dark'}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				height: bottomBarHeight,
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: tabBarHeight,
			}}
		>
			<View style={{ width: width * 0.69, backgroundColor: 'transparent' }}>
				<TouchableOpacity
					onPress={() => { navigation.navigate("Modal", { initialTrack: trackInfo, isPlaying: isPlaying }); }}
					style={{ height: bottomBarHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}>
					<View style={{
						width: listHeight,
						shadowColor: 'black',
						shadowRadius: width * 0.02,
						shadowOpacity: 0.25,
						shadowOffset: { width: -bottomBarHeight * 0.02, height: bottomBarHeight * 0.003 },
						backgroundColor: 'transparent',
					}}>
						<Image
							source={typeof trackInfo.miniArt !== "string" ? defaultMiniArt : { uri: trackInfo.miniArt }}
							style={{
								width: listHeight * 0.82,
								height: listHeight * 0.82,
								margin: listHeight * 0.09,
								borderRadius: 3,
								borderWidth: 0.1,
								borderColor: colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3,
							}}
						/>
					</View>
					<View style={{ width: width - listHeight * 2 - width * 0.25, marginLeft: marginBetweenAlbumartAndText, backgroundColor: 'transparent', }}>
						<Text style={{ fontSize: layout.width * 0.98, }} numberOfLines={1}>
							{trackInfo.title}
						</Text>
					</View>
				</TouchableOpacity>
			</View>
			<View style={{ width: width * 0.28, height: bottomBarHeight, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
				<TouchableOpacity
					disabled={trackInfo.url === 'loading'}
					onPress={async () => {
						if (isPlaying) {
							await Player.pause();
							setIsPlaying(false);
						} else {
							await Player.play();
						}
					}}
					style={{ padding: isPlaying ? layout.width * 0.5 : layout.width * 0.675, }}
				>
					<Ionicons
						name={isPlaying ? "pause" : "play"}
						size={isPlaying ? layout.width * 2 : layout.width * 1.65}
						color={colorScheme === "light" ? (trackInfo.url === 'loading' ? Colors.light.text2 : Colors.light.text) : (trackInfo.url === 'loading' ? Colors.dark.text2 : Colors.dark.text)}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					disabled={trackInfo.url === 'loading'}
					onPress={async () => {
						await Player.skipToNext();
					}}
					style={{ padding: layout.width * 0.6, marginRight: width * 0.05 }}
				>
					<Ionicons
						name="play-forward"
						size={layout.width * 1.75}
						color={colorScheme === "light" ? (trackInfo.url === 'loading' ? Colors.light.text2 : Colors.light.text) : (trackInfo.url === 'loading' ? Colors.dark.text2 : Colors.dark.text)}
					/>
				</TouchableOpacity>
			</View>
		</BlurView>
	)
}
