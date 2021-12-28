import React from 'react';
import { TouchableOpacity, Keyboard, Dimensions, useWindowDimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

import { View, Text } from '../components/Themed';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Music } from '../types';
import Player from '../containers/Player';
import TrackPlayer from 'react-native-track-player';

const { width } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.025;
const listHeightWithoutScale = width * 0.16;
const marginHorizontal = width * 0.05;
const defaultMiniArt = require('../assets/images/blank.png');


export default function RenderSong({ item, colorScheme }: { item: Music, colorScheme: string }) {

	const listHeight = listHeightWithoutScale * useWindowDimensions().fontScale;


	return (
		<TouchableOpacity
			onPress={async () => {
				Keyboard.dismiss();

				if (Player.tracks[Player.currentIndex].id !== item.id) {
					await Player.createNewTracks(Player.musicList.find(element => element.id === item.id));
					await Player.play();
					Player.updateMusicSelection(Player.musicList.find(element => element.id === item.id) ?? Player.defaultMusic);
				}
				else {
					await TrackPlayer.seekTo(0);
					await Player.play();
				}

			}}
			style={{ height: listHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}
			activeOpacity={0.35}
		>
			<View>
				<FastImage
					source={typeof item.miniArt === "number" ? defaultMiniArt : { uri: item.miniArt }}
					style={{
						width: listHeightWithoutScale * 0.82,
						height: listHeightWithoutScale * 0.82,
						margin: listHeightWithoutScale * 0.09,
						borderRadius: layout.width * 0.18,
						borderWidth: 0.15,
						borderColor: colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor,
					}}
				/>
			</View>
			<View style={{ flex: 1, marginLeft: marginBetweenAlbumartAndText }}>
				{item.artist === "" &&
					<View style={{ height: listHeight, width: width - listHeightWithoutScale * 2 - marginHorizontal, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ fontSize: layout.width * 0.93 }} numberOfLines={1}>{item.title}</Text>
					</View>
				}
				{item.artist !== "" &&
					<View>
						<View style={{ height: listHeight / 2.4, width: width - listHeightWithoutScale * 2 - marginHorizontal, flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ fontSize: layout.width * 0.93 }} numberOfLines={1}>{item.title}</Text>
						</View>
						<View style={{ height: listHeight / 3.2, width: width - listHeightWithoutScale * 2 - marginHorizontal, flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ fontSize: layout.width * 0.76, color: colorScheme === "light" ? Colors.light.text2 : Colors.dark.text2, fontWeight: '300' }} numberOfLines={1}>{item.artist}</Text>
						</View>
					</View>
				}
			</View>
		</TouchableOpacity>
	)
}
