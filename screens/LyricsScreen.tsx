import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ImageBackground, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress, usePlaybackState, State } from 'react-native-track-player';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import Player from '../containers/Player';
import layout from '../constants/layout';
import { Track } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get("window");
const statusBarHeight = getStatusBarHeight();

const lightFilter = 'rgba(0, 0, 0, 0.4)';
const darkFilter = 'rgba(0, 0, 0, 0.5)';
const theme = 'rgba(255, 255, 255, 0.8)';
const dullTheme = 'rgba(255, 255, 255, 0.65)';
const progressBarDullTheme = 'rgba(255, 255, 255, 0.25)';

const artworkSize = width * 0.18;

// const blurRadius = 16700000 / Math.pow(height, 1.8);
let blurRadius = 0;
if ((height / width) > 2) {
	blurRadius = 180;
}
else {
	blurRadius = 120;
}

const hasNotch = (height / width) > 2 ? true : false;

const defaultArtwork = require('../assets/images/blank.png');


export default function LyricsScreen({ route, navigation }: { route: { params: { initialTrack: Track, isPlaying: boolean, isRepeat: boolean } }, navigation: any }) {
	const track = useRef<Track>(route.params.initialTrack);
	const [isPlaying, setIsPlaying] = useState(route.params.isPlaying);
	const { position, duration } = useProgress();

	const colorScheme = useColorScheme();
	const [isSliding, setIsSliding] = useState(false);
	const slidingValue = useRef(0);
	const scrollView = useRef<ScrollView>(null);

	const playbackState = usePlaybackState();
	const [trackInfo, setTrackInfo] = useState<any>({
		info: track.current,
		artwork: typeof route.params.initialTrack.artwork !== "string" ? defaultArtwork : { uri: route.params.initialTrack.artwork },
		miniArt: typeof route.params.initialTrack.miniArt !== "string" ? defaultArtwork : { uri: route.params.initialTrack.miniArt },
	});


	useEffect(() => {
		async function updateTrack() {
			const currentTrackPlayerIndex = await TrackPlayer.getCurrentTrack();
			const currentTrackPlayerTrack = Player.tracks[currentTrackPlayerIndex ?? 0];
			track.current = currentTrackPlayerTrack;
			setTrackInfo({
				info: track.current,
				artwork: typeof track.current.artwork !== "string" ? defaultArtwork : { uri: track.current.artwork },
				miniArt: typeof track.current.miniArt !== "string" ? defaultArtwork : { uri: track.current.miniArt },
			});

			scrollView.current?.scrollTo({ y: 0, animated: false })
		}

		if (playbackState === State.Playing) {
			setIsPlaying(true);
		} else if (playbackState === State.Paused) {
			setIsPlaying(false);
		} else if (playbackState === State.Ready) {
			updateTrack();
		}
	}, [playbackState]);


	return (
		<ImageBackground
			source={trackInfo.miniArt}
			blurRadius={blurRadius}
			style={{ flex: 1, transform: [{ rotate: '180deg' }] }}
		>
			<StatusBar barStyle="light-content" animated={true} />
			<View style={{ flex: 1, transform: [{ rotate: '180deg' }], alignItems: 'center', backgroundColor: colorScheme === 'light' ? lightFilter : darkFilter }}>


				<View style={{
					height: layout.ratio * 7.5,
					width: width,
					flexDirection: 'row',
					alignItems: 'flex-end',
					marginVertical: width * 0.02,
				}}>
					<View style={{ flexDirection: 'row', alignItems: 'center', }}>

						<View style={{
							height: artworkSize,
							width: artworkSize,
							flexDirection: 'row',
							alignItems: 'center',
							marginLeft: layout.marginHorizontal,
							shadowColor: 'black',
							shadowRadius: width * 0.02,
							shadowOpacity: 0.3,
							shadowOffset: { width: -artworkSize * 0.015, height: artworkSize * 0.01 },
						}}>
							<Image
								source={{ uri: track.current.artwork }}
								style={{ height: '80%', width: '80%', margin: '10%', borderRadius: layout.width * 0.2 }}
							/>
						</View>


						<View style={{ flex: 6, marginLeft: layout.width * 0.4, }}>
							<View style={{ height: layout.ratio * 1.6, flexDirection: 'row', alignItems: 'center', }}>
								<Text style={styles.title} numberOfLines={1}>{trackInfo.info.title}</Text>
							</View>
							<Text style={styles.artist} numberOfLines={1}>{trackInfo.info.artist}</Text>
						</View>

						<TouchableOpacity
							onPress={() => { navigation.goBack(); }}
							style={{padding: layout.width, marginRight: layout.width * 0.2}}
						>
							<Ionicons name='close-circle-outline' size={layout.width * 2.2} color={dullTheme} />
						</TouchableOpacity>
					</View>
				</View>


				<ScrollView
					fadingEdgeLength={10}
					style={{ height: height * 0.5, width: width, paddingHorizontal: hasNotch ? width * 0.1 : width * 0.08, paddingVertical: width * 0.06 }}
					showsVerticalScrollIndicator={false}
					ref={scrollView}
				>

					{track.current.lyrics.length === 0 &&
						<Text style={{ fontSize: layout.width * 1.25, fontWeight: '600', lineHeight: layout.width * 2, color: dullTheme, textAlign: 'center', marginTop: height * 0.24 }}>
							Couldn't find lyrics.
						</Text>
					}
					{track.current.lyrics.length !== 0 &&
						<Text style={{ fontSize: layout.width * 1.25, fontWeight: '600', lineHeight: layout.width * 2.2, color: theme }}>
							{track.current.lyrics}
						</Text>
					}
					<View style={{ height: height * 0.12 }} />

				</ScrollView>


				<View style={{ height: layout.ratio * 3.5, flexDirection: 'row', }}>
					<View style={{ justifyContent: 'center', alignItems: 'center' }}>
						<Slider
							style={styles.progressContainer}
							value={isSliding === true ? slidingValue.current : (duration === 0 ? 0 : (position / duration))}
							minimumValue={0}
							maximumValue={1}
							thumbTintColor='#d2d2d2'
							minimumTrackTintColor={dullTheme}
							maximumTrackTintColor={progressBarDullTheme}
							onSlidingStart={() => { setIsSliding(true); }}
							onValueChange={(value) => { slidingValue.current = value; }}
							onSlidingComplete={async (value) => {
								await TrackPlayer.seekTo(value * duration);
								setTimeout(() => setIsSliding(false), 1000);
							}}
						/>
						<View style={styles.progressLabelContainer}>
							<Text style={{ color: dullTheme, fontSize: layout.width * 0.75, fontVariant: ['tabular-nums'] }}>
								{position > 0 ? Math.floor(position / 60).toString() : '0'}:{position > 0 ? Math.floor(position % 60).toString().padStart(2, '0') : '00'}
							</Text>
							<Text style={{ color: dullTheme, fontSize: layout.width * 0.75, fontVariant: ['tabular-nums'] }}>
								-{Math.floor((duration - position) / 60).toString()}:{Math.floor((duration - position) % 60).toString().padStart(2, '0')}
							</Text>
						</View>
					</View>
				</View>



				<View style={{ height: layout.ratio * 6, flexDirection: 'row', }}>
					<View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
						<View style={{
							width: width * 0.67,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}>
							<TouchableOpacity
								disabled={trackInfo.info.url === 'loading'}
								onPress={async () => {
									await Player.skipToPrevious(position);

									const skipToPreviousTrackThreshold = 5;
									if (position < skipToPreviousTrackThreshold) {
										scrollView.current?.scrollTo({ y: 0, animated: false })
									}
								}}
								style={{ padding: layout.width * 0.5 }}
							>
								<Ionicons name="play-back" size={layout.width * 2} color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme} />
							</TouchableOpacity>
							<TouchableOpacity
								disabled={trackInfo.info.url === 'loading'}
								onPress={async () => {
									if (isPlaying) {
										await Player.pause();
										setIsPlaying(false);
									} else {
										await Player.play();
										setIsPlaying(true);
									}
								}}
								style={{ padding: isPlaying ? layout.width * 0.2 : layout.width * 0.4 }}
							>
								<Ionicons
									name={isPlaying ? "pause" : "play"}
									size={isPlaying ? layout.width * 2.8 : layout.width * 2.4}
									color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme}
									style={{ marginLeft: isPlaying ? 0 : layout.width * 0.2 }}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								disabled={trackInfo.info.url === 'loading'}
								onPress={async () => {
									await Player.skipToNext();
									scrollView.current?.scrollTo({ y: 0, animated: false })
								}}
								style={{ padding: layout.width * 0.5 }}
							>
								<Ionicons name="play-forward" size={layout.width * 2} color={trackInfo.info.url === 'loading' ? Colors.dark.text2 : theme} />
							</TouchableOpacity>
						</View>
					</View>

				</View>
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	artworkWrapper: {
		marginTop: statusBarHeight + height * 0.07,
		height: width * 0.855,
		width: width,
		alignItems: 'center',
		shadowColor: 'black',
		shadowRadius: width * 0.075,
		shadowOpacity: 0.3,
		// backgroundColor: 'pink',
	},
	arworkImage: {
		width: width * 0.855,
		height: width * 0.855,
		borderRadius: width / 32,
	},
	title: {
		fontSize: layout.width * 1.1,
		color: theme,
		fontWeight: '600',
	},
	artist: {
		fontSize: layout.width * 1,
		color: dullTheme,
		fontWeight: '300',
	},
	progressContainer: {
		width: width * 0.82,
		alignItems: 'center',
	},
	progressLabelContainer: {
		width: width * 0.82,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
});
