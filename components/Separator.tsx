import React from "react";
import { View } from "./Themed"
import { Dimensions } from "react-native"
import layout from "../constants/layout";


const { width } = Dimensions.get('screen');

export default function RenderSeparator() {
	return (
		<View
			style={{
				height: 1,
				marginLeft: layout.listHeightWithoutScale + layout.marginBetweenAlbumartAndText + width * 0.045,
				marginRight: width * 0.06,
			}}
			lightColor='#dfdfdf'
			darkColor='#343434'
		/>
	)
}
