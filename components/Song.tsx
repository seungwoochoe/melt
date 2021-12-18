import React from 'react';
import { TouchableOpacity, Keyboard, Dimensions, Image, useWindowDimensions } from 'react-native';

import { View, Text } from '../components/Themed';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Music } from '../types';
import Player from '../containers/Player';

const { width } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
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
					await Player.createNewTracks(item);
					await Player.play();
					Player.updateMusicSelection(item);
				}
			}}
			style={{ height: listHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}
		>
			<View>
				<Image
					source={typeof item.miniArt === "number" ? defaultMiniArt : { uri: item.miniArt }}
					style={{
						width: listHeightWithoutScale * 0.83,
						height: listHeightWithoutScale * 0.83,
						margin: listHeightWithoutScale * 0.085,
						borderRadius: 3,
						borderWidth: 0.15,
						borderColor: colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3,
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
