import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer, { usePlaybackState, State, useProgress, RepeatMode } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import FastImage from 'react-native-fast-image';
import TextTicker from 'react-native-text-ticker';
import { Easing } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Music } from '../types';

import Player from '../containers/Player';

const { width, height } = Dimensions.get('screen');
const listHeight = width * 0.16;
const marginBetweenAlbumartAndText = width * 0.029;
const bottomBarHeight = listHeight * 1.1;
const defaultMiniArt = require('../assets/images/blank.png');

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
	const [currentMusic, setCurrentMusic] = useState<Music>(Player.defaultMusic);
	const [isPlaying, setIsPlaying] = useState(false);

	const storedPosition = useRef(0);
	const secPlayed = useRef(0);
	const isRepeat = useRef(false);

	const colorScheme = useColorScheme();
	const playbackState = usePlaybackState();
	const { position, duration } = useProgress();
	const navigation = useNavigation<any>();

	useEffect(() => {
		async function getStoredPlaybackStatus() {
			await getStoredPosition();
			await getStoredSecPlayed();
			await getAndSetIsRepeat();
		}
		async function getStoredPosition() {
			try {
				const jsonValue = await AsyncStorage.getItem('storedPosition');
				storedPosition.current = jsonValue != null ? Number(JSON.parse(jsonValue)) : 0;
			} catch (e) {
				// console.log(e);
			}
			await TrackPlayer.seekTo(storedPosition.current);
		}
		async function getStoredSecPlayed() {
			try {
				const jsonValue = await AsyncStorage.getItem('secPlayed');
				secPlayed.current = jsonValue != null ? Number(JSON.parse(jsonValue)) : 0;
			} catch (e) {
				// console.log(e);
			}
		}
		async function getAndSetIsRepeat() {
			try {
				const jsonValue = await AsyncStorage.getItem('isRepeat');
				isRepeat.current = jsonValue != null ? JSON.parse(jsonValue) : false;
			} catch (e) {
				// console.log(e);
			}
			if (isRepeat.current) {
				await TrackPlayer.setRepeatMode(RepeatMode.Track);
			}
		}
		getStoredPlaybackStatus();
	}, []);


	useEffect(() => { // UI update.
		if (playbackState === State.Playing) {
			setIsPlaying(true);
		}
		else if (playbackState === State.Paused) {
			setIsPlaying(false)
		}
	}, [playbackState]);


	useEffect(() => { // Fired when a new track is ready.
		async function handlePlayNext() {
			const trackPlayerIndex = await TrackPlayer.getCurrentTrack();

			if (trackPlayerIndex > Player.currentIndex) {
				await Player.handlePlayNext();
			}

			if (currentMusic.id !== Player.tracks[trackPlayerIndex].id) { // Duration value set as 0 at first and then changes to the actual value.
				secPlayed.current = 0;
			}

			Player.currentDuration = duration;
			setCurrentMusic(Player.musicList.find(element => element.id === Player.tracks[Player.currentIndex].id) ?? Player.defaultMusic);
			await Player.storeTracksStatus();
			Player.updateTopMusic();
		}

		if (Player.musicList.length !== 0) {
			handlePlayNext();
		}
	}, [duration]);


	useEffect(() => {
		async function storeSecPlayedAndPosition() {
			await storeSecPlayed();
			await storePosition();
		}
		async function storeSecPlayed() {
			if (isPlaying === true) {
				secPlayed.current++;
				try {
					const jsonValue = JSON.stringify(secPlayed.current);
					await AsyncStorage.setItem('secPlayed', jsonValue);
				} catch (e) {
					// console.log(e);
				}
			}
		}
		async function storePosition() {
			storedPosition.current = position;
			try {
				const jsonValue = JSON.stringify(storedPosition.current);
				await AsyncStorage.setItem('storedPosition', jsonValue);
			} catch (e) {
				// console.log(e);
			}
		}
		storeSecPlayedAndPosition();
	}, [Math.floor(position)]);



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
				borderTopWidth: 0.5,
				borderTopColor: colorScheme === 'light' ? Colors.light.borderLightColor : Colors.dark.borderLightColor,
			}}
		>
			<View style={{ width: width * 0.69, backgroundColor: 'transparent' }}>
				<TouchableOpacity
					onPress={async () => {
						if (Player.musicList.length !== 0) {
							const repeatMode = await TrackPlayer.getRepeatMode();
							isRepeat.current = repeatMode === RepeatMode.Track;
							navigation.navigate("Modal", {
								id: currentMusic.id,
								isPlaying: isPlaying,
								isRepeat: isRepeat.current,
								progress: (position / duration),
								position: position,
								duration: duration,
							});
						}
					}}
					style={{ height: bottomBarHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}
					activeOpacity={0.35}>
					<View style={{
						width: listHeight,
						shadowColor: 'black',
						shadowRadius: width * 0.02,
						shadowOpacity: 0.25,
						shadowOffset: { width: -bottomBarHeight * 0.02, height: bottomBarHeight * 0.003 },
						backgroundColor: 'transparent',
					}}>
						<FastImage
							source={typeof currentMusic.miniArt !== "string" ? defaultMiniArt : { uri: currentMusic.miniArt }}
							style={{
								width: listHeight * 0.82,
								height: listHeight * 0.82,
								margin: listHeight * 0.09,
								borderRadius: layout.width * 0.18,
								borderWidth: 0.15,
								borderColor: colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor,
							}}
						/>
					</View>


					<MaskedView
						maskElement={<LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['transparent', 'black', 'black', 'transparent']} style={{ flex: 1 }} locations={[0.015, 0.05, 0.94, 1]} />}
					>
						<View style={{ width: width - listHeight * 2 - width * 0.18, backgroundColor: 'transparent', }}>
							<TextTicker
								style={{ fontSize: layout.width * 0.95, paddingLeft: width * 0.02, paddingRight: width * 0.02, color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text }}
								scrollSpeed={50}
								bounce={false}
								marqueeDelay={5000}
								scroll={false}
								easing={Easing.linear}
							>
								{currentMusic.title}
							</TextTicker>
						</View>
					</MaskedView>

				</TouchableOpacity>
			</View>
			<View style={{ width: width * 0.28, height: bottomBarHeight, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
				<TouchableOpacity
					disabled={currentMusic.url === 'loading'}
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
						color={colorScheme === "light" ? (currentMusic.url === 'loading' ? Colors.light.text2 : Colors.light.text) : (currentMusic.url === 'loading' ? Colors.dark.text2 : Colors.dark.text)}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					disabled={currentMusic.url === 'loading'}
					onPress={async () => {
						await Player.skipToNext();
					}}
					style={{ padding: layout.width * 0.6, marginRight: width * 0.05 }}
				>
					<Ionicons
						name="play-forward"
						size={layout.width * 1.74}
						color={colorScheme === "light" ? (currentMusic.url === 'loading' ? Colors.light.text2 : Colors.light.text) : (currentMusic.url === 'loading' ? Colors.dark.text2 : Colors.dark.text)}
					/>
				</TouchableOpacity>
			</View>
		</BlurView>
	)
}
