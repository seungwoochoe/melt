import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Platform, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import scale from '../constants/scale';
import { Track } from '../types';

import Player from '../containers/Player';

const { width } = Dimensions.get('screen');
const listHeight = width * 0.149;
const marginBetweenAlbumartAndText = width * 0.029;
const bottomBarHeight = listHeight * 1.2;
const blankTrack: Track = { url: 'loading...', title: 'loading title...', artist: 'loading artist...', artwork: require('../assets/images/blank.png') };

let blurIntensity: number;
if (Platform.OS === 'ios') {
	blurIntensity = 97;
} else {
	blurIntensity = 200;
}

export default function RenderBottomBar() {
	const [isPlaying, setIsPlaying] = React.useState(false);
	const colorScheme = useColorScheme();
	const [track, setTrack] = React.useState<any>(Player.musicList[0] ?? blankTrack);


	useTrackPlayerEvents([Event.PlaybackState], event => {
		if (event.state === 'playing') {
			setIsPlaying(true);
		} else if (event.state === 'paused') {
			setIsPlaying(false);
		}
	})

	useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
		setTrack(Player.musicList[Player.currentIndex]);
	});

	const RenderSongForBottomBar = ({ item }: { item: Track }) => {
	return (
			<TouchableOpacity
				onPress={() => { }}
				style={{ height: bottomBarHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}>
				<View style={{
					width: listHeight,
					shadowColor: 'black',
					shadowRadius: width * 0.02,
					shadowOpacity: 0.25,
					shadowOffset: { width: -bottomBarHeight * 0.02, height: bottomBarHeight * 0.003 },
					backgroundColor: 'transparent',
				}}>
					<FastImage
						source={typeof item.artwork === "number" ? item.artwork : {uri: item.artwork}}
						style={styles.artwork}
					/>
				</View>
				<View style={{ width: width - listHeight * 2 - width * 0.25, marginLeft: marginBetweenAlbumartAndText, backgroundColor: 'transparent', }}>
					<Text style={{ fontSize: scale.width * 0.98, }} numberOfLines={1}>
						{item.title}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}

	return (
		<BlurView intensity={blurIntensity} tint={colorScheme === 'light' ? 'light' : 'dark'} style={styles.bottomBarContainer}>
			<View style={{ width: width * 0.69 , backgroundColor: 'transparent'}}>
				<RenderSongForBottomBar item={track} />
			</View>
			<View style={{ width: width * 0.28, height: bottomBarHeight, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
				<TouchableOpacity
					onPress={async () => {
						if (isPlaying) {
							await TrackPlayer.pause();
						} else {
							await TrackPlayer.play();
						}
					}}
					style={{ padding: isPlaying ? scale.width * 0.5 : scale.width * 0.675, }}
				>
					<Ionicons name={isPlaying ? "pause" : "play"} size={isPlaying ? scale.width * 2 : scale.width * 1.65} color={colorScheme === "light" ? Colors.light.text : Colors.dark.text}></Ionicons>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={async () => {
						await Player.playNext();
					}}
					style={{ padding: scale.width * 0.6, marginRight: width * 0.05 }}
				>
					<Ionicons name="play-forward" size={scale.width * 1.75} color={colorScheme === "light" ? Colors.light.text : Colors.dark.text}></Ionicons>
				</TouchableOpacity>
			</View>
		</BlurView>
	)
}

const styles = StyleSheet.create({
	artwork: {
		width: listHeight * 0.9,
		height: listHeight * 0.9,
		margin: listHeight * 0.05,
		borderRadius: 4.5,
	},
	bottomBarContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		height: bottomBarHeight,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
	},
	bottomMusic: {
		alignItems: 'center',
		height: listHeight,
		flexDirection: 'row',
		paddingLeft: width * 0.05,
	}
});