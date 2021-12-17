import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import TrackPlayer, { Event, useTrackPlayerEvents, usePlaybackState, State, useProgress } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Track } from '../types';

import Player from '../containers/Player';

const { width } = Dimensions.get('screen');
const listHeight = width * 0.16;
const marginBetweenAlbumartAndText = width * 0.029;
const bottomBarHeight = listHeight * 1.12;
const defaultMiniArt = require('../assets/images/blank.png');
const blankTrack: Track = { url: 'loading', title: 'processing files...', artist: '', artwork: defaultMiniArt, miniArt: defaultMiniArt, id: 'blankTrack', isPlayed: false, isTrigger: false };

let blurIntensity: number;
if (Platform.OS === 'ios') {
	blurIntensity = 97;
} else {
	blurIntensity = 200;
}

export default function RenderBottomBar() {
	const [trackInfo, setTrackInfo] = useState<Track>(blankTrack);
	const [isPlaying, setIsPlaying] = useState(false);

	const colorScheme = useColorScheme();
	const playbackState = usePlaybackState();
	const { duration } = useProgress();
	const navigation = useNavigation<any>();


	useEffect(() => {
		if (playbackState === State.Playing) {
			setIsPlaying(true);
		}
		else if (playbackState === State.Paused) {
			setIsPlaying(false)
		}
		else if (playbackState === State.Ready) {
			setTrackInfo(Player.tracks[Player.currentIndex]);
			Player.storeTracks();
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


	return (
		<BlurView intensity={blurIntensity} tint={colorScheme === 'light' ? 'light' : 'dark'} style={styles.bottomBarContainer}>
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
							style={styles.miniArt}
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

const styles = StyleSheet.create({
	miniArt: {
		width: listHeight * 0.82,
		height: listHeight * 0.82,
		margin: listHeight * 0.09,
		borderRadius: 4.5,
	},
	bottomBarContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		height: bottomBarHeight,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 49,
	},
	bottomMusic: {
		alignItems: 'center',
		height: listHeight,
		flexDirection: 'row',
		paddingLeft: width * 0.05,
	}
});
