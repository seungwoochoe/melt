import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions, Image, useWindowDimensions } from 'react-native';

import { View, Text } from '../components/Themed';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { WeightedMusic } from '../types';
import Player from '../containers/Player';

const { width } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.16;
const marginHorizontal = width * 0.05;
const defaultMiniArt = require('../assets/images/blank.png');

export default function RenderSong({ item, colorScheme }: { item: WeightedMusic, colorScheme: string }) {

	const listHeight = listHeightWithoutScale * useWindowDimensions().fontScale;

	return (
		<TouchableOpacity
			onPress={async () => {
				await Player.createNewTracks(item);
				await Player.play();
			}}
			style={{ height: listHeight, width: width, paddingHorizontal: width * 0.045, flexDirection: 'row', alignItems: 'center' }}
		>
			<View>
				<Image
					source={typeof item.miniArt === "number" ? defaultMiniArt : { uri: item.miniArt }}
					style={styles.miniArt}
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


const styles = StyleSheet.create({
	miniArt: {
		width: listHeightWithoutScale * 0.82,
		height: listHeightWithoutScale * 0.82,
		margin: listHeightWithoutScale * 0.09,
		borderRadius: 4.5,
	},
});
