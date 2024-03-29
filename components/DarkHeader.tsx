import * as React from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import layout from '../constants/layout';

const headerHeight = 44 + getStatusBarHeight();


export default function RenderDarkHeader({ title, blur }: { title: string, blur: boolean }) {

	const colorScheme = useColorScheme();

	let blurIntensity: number;
	if (Platform.OS === 'ios') {
		blurIntensity = colorScheme === 'light' ? 97 : 100;
	} else {
		blurIntensity = 200;
	}

	const RenderTitle = () => {
		return (
			<View style={{ flex: 1, alignSelf: 'center', flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'transparent' }}>
				<Text style={{ fontSize: layout.width * 1, fontWeight: '600', marginBottom: 10 }}>
					{title}
				</Text>
			</View>
		)
	}

	return (
		<>
			{blur &&
				<BlurView
					intensity={blurIntensity}
					tint={colorScheme === 'light' ? 'light' : 'dark'}
					style={{
						...styles.header,
						borderBottomWidth: 1,
						borderBottomColor: colorScheme === 'light' ? '#dfdfdf' : '#252525',
					}}>
					<RenderTitle />
				</BlurView>
			}

			{!blur &&
				<View style={{ ...styles.header, backgroundColor: colorScheme === 'light' ? '#f2f2f7' : '#000' }}>
				</View>
			}
		</>
	)
}

const styles = StyleSheet.create({
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: headerHeight,
	}
});