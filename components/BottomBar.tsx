import * as React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

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

let blurIntensity: number;
if (Platform.OS === 'ios') {
	blurIntensity = 97;
} else {
	blurIntensity = 200;
}

export default function RenderBottomBar() {
	const [isBusy, setIsBusy] = React.useState(false);
	const colorScheme = useColorScheme();


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
					<Image
						source={item.artwork}
						style={styles.artwork}
					/>
				</View>
				<View style={{ width: width - listHeight * 2 - width * 0.22, marginLeft: marginBetweenAlbumartAndText, backgroundColor: 'transparent', }}>
					<Text style={{ fontSize: scale.width, }} numberOfLines={1}>
						{item.title}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}

	return (
		<BlurView intensity={blurIntensity} tint={colorScheme === 'light' ? 'light' : 'dark'} style={styles.bottomBarContainer}>
			<View style={{ flex: 13, backgroundColor: 'transparent' }}>
				<RenderSongForBottomBar item={Player.playlist == null ? Player.musicList[0] : Player.playlist[Player.currentIndex]} />
			</View>
			<View style={{ flex: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' }}>
				<TouchableOpacity
					disabled={isBusy}
					onPress={async () => {
						await Player.play();
						// if (Player.isPlaying) {
						//   await Player.pause();
						//   setCount(c => c + 1);
						// } else {
						//   await Player.play();
						//   setCount(c => c + 1);
						// }
					}}
					style={{ padding: Player.isPlaying ? scale.width * 0.6 : scale.width * 0.775 }}
				>
					<Ionicons name={Player.isPlaying ? "pause" : "play"} size={Player.isPlaying ? scale.width * 2 : scale.width * 1.65} color={colorScheme === "light" ? Colors.light.text : Colors.dark.text}></Ionicons>
				</TouchableOpacity>
				<TouchableOpacity
					disabled={!isBusy}
					onPress={async () => {
						// setIsAvailable(false);
						// await Player.skipToNext();
						// setIsAvailable(true);
					}}
					style={{ padding: scale.width * 0.53, marginRight: width * 0.05 }}
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