import * as React from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { View, Text } from '../components/Themed';
import scale from '../constants/scale';

const { width } = Dimensions.get('screen');
const titleHeight = scale.ratio * 3.2;
const headerHeight = 44 + getStatusBarHeight();

export default function RenderTitle({ title }: { title: string }) {

	const RenderTopMargin = () => {
		return (
			<View style={{ height: headerHeight, width: width }} />
		)
	};

	const RenderTitle = () => {
		return (
			<Text
				style={{ height: titleHeight * useWindowDimensions().fontScale, fontSize: scale.width * 1.9, fontWeight: 'bold', marginLeft: width * 0.06, paddingTop: scale.ratio * 0.3 }}
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