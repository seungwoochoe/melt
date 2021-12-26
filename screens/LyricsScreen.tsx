import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { useProgress, usePlaybackState, State } from 'react-native-track-player';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import LinearGradient from 'react-native-linear-gradient';
import { getMetadata } from '../containers/Reader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TextTicker from 'react-native-text-ticker';
import MaskedView from '@react-native-masked-view/masked-view';
import { Easing } from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

import Player from '../containers/Player';
import layout from '../constants/layout';
import { Music } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get("window");
const statusBarHeight = getStatusBarHeight();

const lightFilter = 'rgba(0, 0, 0, 0.35)';
const darkFilter = 'rgba(0, 0, 0, 0.4)';
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


export default function LyricsScreen({ route, navigation }: { route: { params: { id: string, isPlaying: boolean, progress: number, position: number, duration: number } }, navigation: any }) {
	const [currentMusic, setCurrentMusic] = useState<Music>(Player.musicList.find(elemnet => elemnet.id === route.params.id) ?? Player.defaultMusic);
	const [isPlaying, setIsPlaying] = useState(route.params.isPlaying);
	const { position, duration } = useProgress();

	const colorScheme = useColorScheme();
	const [isSliding, setIsSliding] = useState(false);
	const slidingValue = useRef(0);
	const scrollView = useRef<ScrollView>(null);

	const playbackState = usePlaybackState();


	useEffect(() => {
		async function updateTrack() {
			const currentTrackPlayerIndex = await TrackPlayer.getCurrentTrack();
			setCurrentMusic(Player.musicList.find(element => element.id === Player.tracks[currentTrackPlayerIndex].id) ?? Player.defaultMusic);
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
			source={typeof currentMusic.miniArt !== "string" ? defaultArtwork : { uri: currentMusic.miniArt }}
			blurRadius={blurRadius}
			style={{ flex: 1, transform: [{ rotate: '180deg' }] }}
		>
			<StatusBar barStyle="light-content" animated={true} />
			<View style={{ flex: 1, transform: [{ rotate: '180deg' }], alignItems: 'center', backgroundColor: colorScheme === 'light' ? lightFilter : darkFilter }}>

				<LinearGradient
					colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .15)']}
					locations={[0, 1]}
					style={{
						position: 'absolute',
						height: '100%',
						width: '100%',
					}}
				/>

				<View style={{
					height: layout.ratio * 7.5,
					width: width,
					flexDirection: 'row',
					alignItems: 'flex-end',
					marginTop: width * 0.02,
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
							<FastImage
								source={typeof currentMusic.miniArt !== "string" ? defaultArtwork : { uri: currentMusic.miniArt }}
								style={{ height: '80%', width: '80%', margin: '10%', borderRadius: layout.width * 0.2, }}
							/>
						</View>


						<MaskedView
							style={{ flex: 6,}}
							maskElement={
								<LinearGradient
									style={{ flex: 1 }}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									colors={['transparent', 'black', 'black', 'transparent']}
									locations={[0.01, 0.04, .91, .94]}
								/>}
						>
							<View style={{ height: layout.ratio * 1.6, flexDirection: 'row', alignItems: 'center', }}>
								<TextTicker
									style={{
										fontSize: layout.width * 1,
										color: theme,
										fontWeight: '600',
										paddingLeft: layout.width * 0.3,
									}}
									scrollSpeed={60}
									bounce={false}
									marqueeDelay={3000}
									scroll={false}
									easing={Easing.linear}
								>
									{currentMusic.title}
								</TextTicker>
							</View>

							<TextTicker
								style={{
									fontSize: layout.width * .95,
									color: dullTheme,
									fontWeight: '300',
									paddingLeft: layout.width * 0.3,
								}}
								scrollSpeed={55}
								bounce={false}
								marqueeDelay={3000}
								scroll={false}
								easing={Easing.linear}
							>
								{currentMusic.artist}
							</TextTicker>
						</MaskedView>


						<TouchableOpacity
							onPress={() => { navigation.goBack(); }}
							style={{ padding: layout.width * 1.4, marginRight: layout.width * 0.2 }}
						>
							<Ionicons name='close-outline' size={layout.width * 2.4} color={theme} />
						</TouchableOpacity>
					</View>
				</View>


				<MaskedView
					style={{ height: height * 0.6, width: width, marginBottom: width * 0.03 }}
					maskElement={
						<LinearGradient
							style={{ flex: 1 }}
							colors={['transparent', 'black', 'black', 'transparent']}
							locations={[0, 0.06, .94, 1]}
						/>}
				>
					<ScrollView
						fadingEdgeLength={10}
						style={{ paddingHorizontal: hasNotch ? width * 0.1 : width * 0.08, paddingTop: width * 0.06, }}
						showsVerticalScrollIndicator={true}
						scrollIndicatorInsets={{top: layout.height, left: 0, bottom: layout.height, right: 0 }}
						ref={scrollView}
					>

						{currentMusic.lyrics.length === 0 &&
							<>
								<Text style={{ fontSize: layout.width * 1.25, fontWeight: '600', lineHeight: layout.width * 2, color: dullTheme, textAlign: 'center', marginTop: height * 0.24 }}>
									No lyrics
								</Text>
								<TouchableOpacity
									onPress={async () => {
										const targetIndex = Player.musicList.findIndex(element => element.id === currentMusic.id);
										const newMetadata = await getMetadata(currentMusic);
										
										Player.musicList.splice(targetIndex, 1, newMetadata);
										setCurrentMusic(Player.musicList[targetIndex])

										const newMusicList = [...Player.musicList];
										try {
											const jsonValue = JSON.stringify(newMusicList);
											await AsyncStorage.setItem('musicList', jsonValue);
										} catch (e) {
											// console.log(e);
										}

									}}
									style={{ alignSelf: 'center', marginTop: layout.width * 4, borderWidth: 1, padding: layout.width * 0.4, borderColor: progressBarDullTheme, borderRadius: 4 }}
								>
									<Text style={{ fontSize: layout.width * 0.8, color: progressBarDullTheme }}>
										Update metadata
									</Text>
								</TouchableOpacity>
							</>
						}
						{currentMusic.lyrics.length !== 0 &&
							<Text style={{ fontSize: layout.width * 1.2, fontWeight: '600', lineHeight: layout.width * 2.2, color: theme }}>
								{currentMusic.lyrics}
							</Text>
						}
						<View style={{ height: height * 0.1 }} />

					</ScrollView>
				</MaskedView>


				<View style={{ height: layout.ratio * 3.5, flexDirection: 'row', }}>
					<View style={{ justifyContent: 'center', alignItems: 'center' }}>
						<Slider
							style={styles.progressContainer}
							value={isSliding === true ? slidingValue.current : (duration === 0 ? route.params.progress : (position / duration))}
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
                {position > 0 ? Math.floor(position / 60).toString() : Math.floor(route.params.position / 60).toString()}
                :{position > 0 ? Math.floor(position % 60).toString().padStart(2, '0') : Math.floor(route.params.position % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={{ color: dullTheme, fontSize: layout.width * 0.75, fontVariant: ['tabular-nums'] }}>
                -{position > 0 ? Math.floor((duration - position) / 60).toString() : Math.floor((route.params.duration - route.params.position) / 60).toString()}
                :{position > 0 ? Math.floor((duration - position) % 60).toString().padStart(2, '0') : Math.floor((route.params.duration - route.params.position) % 60).toString().padStart(2, '0')}
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
								disabled={currentMusic.url === 'loading'}
								onPress={async () => {
									await Player.skipToPrevious(position);

									const skipToPreviousTrackThreshold = 5;
									if (position < skipToPreviousTrackThreshold) {
										scrollView.current?.scrollTo({ y: 0, animated: false })
									}
								}}
								style={{ padding: layout.width * 0.5 }}
							>
								<Ionicons name="play-back" size={layout.width * 2} color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme} />
							</TouchableOpacity>
							<TouchableOpacity
								disabled={currentMusic.url === 'loading'}
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
									color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme}
									style={{ marginLeft: isPlaying ? 0 : layout.width * 0.2 }}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								disabled={currentMusic.url === 'loading'}
								onPress={async () => {
									await Player.skipToNext();
									scrollView.current?.scrollTo({ y: 0, animated: false })
								}}
								style={{ padding: layout.width * 0.5 }}
							>
								<Ionicons name="play-forward" size={layout.width * 2} color={currentMusic.url === 'loading' ? Colors.dark.text2 : theme} />
							</TouchableOpacity>
						</View>
					</View>

				</View>
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	arworkImage: {
		width: width * 0.855,
		height: width * 0.855,
		borderRadius: width / 32,
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
