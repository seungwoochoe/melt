import * as React from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { View, Text } from '../components/Themed';
import layout from '../constants/layout';

const { width } = Dimensions.get('screen');
const titleHeight = layout.ratio * 3.2;
const headerHeight = 44 + getStatusBarHeight();

export default function RenderTitle({ title }: { title: string }) {

	const RenderTopMargin = () => {
		return (
			<View style={{ height: headerHeight, width: width, backgroundColor: 'transparent' }} />
		)
	};

	const RenderTitle = () => {
		return (
			<Text
				style={{ height: titleHeight * useWindowDimensions().fontScale, fontSize: layout.width * 1.8, fontWeight: 'bold', marginLeft: width * 0.06, paddingTop: layout.ratio * 0.1 }}
			>
				{title}
			</Text>
		)
	};


	return (
		<>
			<RenderTopMargin />
			<RenderTitle />
		</>
	);
}