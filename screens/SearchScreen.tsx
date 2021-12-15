import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions, StatusBar, Platform, TextInput, KeyboardAvoidingView, Keyboard, FlatList, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import filter from 'lodash.filter';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Music } from '../types';
import Player from '../containers/Player';
import RenderSong from '../components/Song';

const { width, height } = Dimensions.get('screen');
const marginBetweenAlbumartAndText = width * 0.029;
const listHeightWithoutScale = width * 0.149;
const bottomBarHeight = listHeightWithoutScale * 1.2;
const marginHorizontal = width * 0.05;


export default function SearchScreen() {
	const [query, setQuery] = useState('');
	const [filteredMusicList, setFilteredMusicList] = useState<Music[]>([]);
	const [isKeyboardShown, setIsKeyboardShown] = useState(false);
	const [isScrolled, setIsScrelled] = useState(false);

	const colorScheme = useColorScheme();
	const listHeight = listHeightWithoutScale * useWindowDimensions().fontScale;

	const keyExtractor = useCallback((item) => item.id, []);


	useEffect(() => {
		const keyboardShowSubscription = Keyboard.addListener('keyboardDidShow', () => {
			setIsKeyboardShown(true);
		});

		const keyboardHideSubscription = Keyboard.addListener('keyboardDidHide', () => {
			setIsKeyboardShown(false);
		});

		return () => {
			keyboardShowSubscription.remove();
			keyboardHideSubscription.remove();
		}
	}, []);


	function handleSearch(query: string) {
		if (query.length === 0) {
			setFilteredMusicList([]);
			setQuery(query);
		} else {
			let safeQuery = query;
			const blacklist = ['^', '.', '[', ']', '$', '(', ')', '\\', '*', '{', '}', '?', '+',];

			for (const item of blacklist) {
				safeQuery = safeQuery.replaceAll(item, '');
			}

			const filteredData = filter(Player.musicList, music => {
				return search(music, safeQuery.toLowerCase());
			})
			setFilteredMusicList(filteredData);
			setQuery(query);
		}
	}

	function search({ title, artist }: { title: string, artist: string }, query: string) {
		const condition = new RegExp(`^${query}| ${query}|\\(${query}`);
		if (title.toLowerCase().match(condition) || artist.toLowerCase().match(condition)) {
			return true;
		}
		return false;
	}


	const RenderNoResult = () => {
		return (
			<View style={{ height: isKeyboardShown ? height / 2 : height * 0.7, width: width, flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{flex: 1, textAlign: 'center', fontSize: layout.width * 1.1, fontWeight: '400', color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
					Couldn't find{'\n'}"{query}"
				</Text>
			</View>
		)
	};

	const RenderSeparator = () => {
		return (
			<View
				style={{
					height: 1,
					marginLeft: listHeightWithoutScale + marginBetweenAlbumartAndText + width * 0.045,
					marginRight: width * 0.06,
				}}
				lightColor='#dfdfdf'
				darkColor='#343434'
			/>
		)
	};

	const RenderBottomMargin = () => {
		return (
			<>
				{(Player.musicList.length !== 0 && (query.length === 0 || filteredMusicList.length !== 0)) &&
					<RenderSeparator />
				}

				<View style={{ height: isKeyboardShown ? 0 : bottomBarHeight * 0.99, alignItems: 'center', paddingTop: bottomBarHeight * 0.1 }} />
			</>
		)
	};


	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>

			<StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

			<View style={{ flex: 1, width: width, alignItems: 'center' }}>

				<View>
					<View style={{
						alignSelf: 'center',
						flexDirection: 'row',
						alignItems: 'center',
						height: layout.width * 2.15,
						width: width * 0.89,
						marginHorizontal: marginHorizontal,
						paddingLeft: width * 0.03,
						marginTop: layout.width * 2,
						marginBottom: layout.width,
						borderRadius: 11,
						backgroundColor: colorScheme === 'light' ? Colors.light.text4 : Colors.dark.text4,
					}}>
						<Ionicons name="search-outline" size={layout.width * 1.15} color={colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3} />
						<TextInput
							autoFocus={true}
							autoCapitalize='none'
							autoCorrect={false}
							placeholder="Songs or artists"
							placeholderTextColor={colorScheme === 'light' ? Colors.light.text3 : Colors.dark.text3}
							clearButtonMode='always'
							underlineColorAndroid='transparent'
							value={query}
							onChangeText={queryText => handleSearch(queryText)}
							style={{
								marginLeft: width * 0.02,
								height: layout.width * 3,
								fontSize: layout.width * 1.03,
								width: width * 0.76,
								color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2,
							}}
						/>
					</View>
				</View>

				<FlatList
					data={filteredMusicList}

					ListEmptyComponent={RenderNoResult}
					renderItem={({ item }) => {
						return (
							<RenderSong item={item} colorScheme={colorScheme} />
						)
					}}
					ItemSeparatorComponent={RenderSeparator}
					ListFooterComponent={RenderBottomMargin}

					onScroll={(event) => {
						const scrollOffset = event.nativeEvent.contentOffset.y;

						if (scrollOffset < layout.width * 2.05) {
							if (isScrolled === true) {
								setIsScrelled(false);
							}
						} else {
							if (isScrolled === false) {
								setIsScrelled(true);
							}
						}
					}}

					showsVerticalScrollIndicator={true}
					keyboardShouldPersistTaps='handled'
					scrollEnabled={query.length !== 0 && filteredMusicList.length === 0 ? false : true}
					keyExtractor={keyExtractor}
					getItemLayout={(data, index) => (
						{ length: listHeight + 1, offset: (listHeight + 1) * index, index }
					)}
				/>
			</View>

		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: width,
	},
	miniArt: {
		width: listHeightWithoutScale * 0.88,
		height: listHeightWithoutScale * 0.88,
		margin: listHeightWithoutScale * 0.06,
		borderRadius: 4.5,
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: '80%',
	},
});
