import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions, StatusBar, Platform, TextInput, KeyboardAvoidingView, Keyboard, FlatList, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import filter from 'lodash.filter';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { View, Text } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import layout from '../constants/layout';
import { Music } from '../types';
import Player from '../containers/Player';
import RenderSong from '../components/Song';
import RenderSeparator from '../components/Separator';

const { width, height } = Dimensions.get('screen');


export default function SearchScreen({ navigation }: { navigation: any }) {
	const [query, setQuery] = useState('');
	const [filteredMusicList, setFilteredMusicList] = useState<Music[]>([]);
	const [isKeyboardShown, setIsKeyboardShown] = useState(false);

	const colorScheme = useColorScheme();
	const listHeight = layout.listHeightWithoutScale * useWindowDimensions().fontScale;

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
		}
		else {
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


	const RenderSelectedHistory = () => {
		return (
			<FlatList
				ListEmptyComponent={() => {
					return (
						<View style={{ height: height * 0.5, width: width, flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ flex: 1, textAlign: 'center', fontSize: layout.width * 1.1, color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
								Search for songs and artists.
							</Text>
						</View>
					)
				}}


				ListHeaderComponent={() => {
					if (Player.musicSelection.length !== 0) {
						return (
							<Text style={{
								width: width,
								fontSize: layout.width * 1.28,
								fontWeight: 'bold',
								marginLeft: width * 0.06,
								marginTop: layout.height * 0.3,
								marginBottom: layout.height * 0.6,
								color: colorScheme === 'light' ? Colors.light.text : Colors.dark.text,
							}}>
								Your recent selections
							</Text>
						)
					}
					else {
						return null
					}
				}}

				data={Player.musicSelection}
				renderItem={({ item }) => <RenderSong item={item} colorScheme={colorScheme} />}
				ItemSeparatorComponent={RenderSeparator}
				ListFooterComponent={() => {
					if (Player.musicSelection.length !== 0) {
						return (
							<RenderSeparator />

						)
					}
					else {
						return null;
					}
				}}
				showsVerticalScrollIndicator={false}
			/>
		)
	}

	const RenderNoResult = () => {
		return (
			<View style={{ height: isKeyboardShown ? height / 2 : height * 0.7, width: width, flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{ flex: 1, textAlign: 'center', fontSize: layout.width * 1.1, fontWeight: '400', color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2 }}>
					No results
				</Text>
			</View>
		)
	};


	const RenderBottomMargin = () => {
		return (
			<View style={{
				height: isKeyboardShown ? 0 : layout.bottomBarHeight * 0.99,
				alignItems: 'center',
				paddingTop: layout.bottomBarHeight * 0.1
			}}
			/>
		)
	};


	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>

			<StatusBar barStyle={colorScheme === 'light' ? 'dark-content' : 'light-content'} animated={true} />

			<View style={{ flex: 1, width: width }}>

				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					marginTop: getStatusBarHeight() + 10,
					paddingBottom: layout.height,
					borderBottomWidth: 1,
					borderBottomColor: colorScheme === 'light' ? '#dfdfdf' : '#343434',
				}}>
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						height: layout.width * 2.15,
						width: width * 0.72,
						marginLeft: layout.marginHorizontal,
						paddingLeft: width * 0.03,
						borderRadius: 11,
						backgroundColor: colorScheme === 'light' ? Colors.light.searchbarBackground : Colors.dark.searchbarBackground,
					}}>
						<Ionicons name="search-outline" size={layout.width * 1.15} color={colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor} />
						<TextInput
							autoFocus={true}
							autoCapitalize='none'
							autoCorrect={false}
							placeholder="Search"
							placeholderTextColor={colorScheme === 'light' ? Colors.light.borderColor : Colors.dark.borderColor}
							clearButtonMode='always'
							underlineColorAndroid='transparent'
							value={query}
							onChangeText={queryText => handleSearch(queryText)}
							style={{
								marginLeft: width * 0.02,
								height: layout.width * 3,
								fontSize: layout.width * 1.03,
								width: width * 0.6,
								color: colorScheme === 'light' ? Colors.light.text2 : Colors.dark.text2,
							}}
						/>
					</View>
					<TouchableOpacity
						onPress={() => { navigation.goBack(); }}
						style={{ height: layout.width * 2.15, width: width * 0.21, flexDirection: 'row', alignItems: 'center' }}
					>
						<Text style={{ flex: 1, fontSize: layout.width, textAlign: 'center' }}>
							Cancel
						</Text>
					</TouchableOpacity>
				</View>

				<FlatList
					ListEmptyComponent={() => {
						if (query.length === 0) {
							return (
								<RenderSelectedHistory />
							)
						}
						else {
							return (
								<RenderNoResult />
							)
						}
					}}

					ListHeaderComponent={() => {
						return (
							<View style={{ height: layout.height }} />
						)
					}}

					data={filteredMusicList}
					renderItem={({ item }) => {
						return (
							<RenderSong item={item} colorScheme={colorScheme} />
						)
					}}
					ItemSeparatorComponent={RenderSeparator}
					ListFooterComponent={() => {
						if (filteredMusicList.length !== 0) {
							return (
								<>
									<RenderSeparator />
									<RenderBottomMargin />
								</>
							)
						}
						else {
							return (
								<RenderBottomMargin />
							)
						}
					}}

					showsVerticalScrollIndicator={filteredMusicList.length !== 0}
					keyboardShouldPersistTaps='handled'
					scrollEnabled={!(filteredMusicList.length === 0 && Player.musicSelection.length === 0)}
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
		width: layout.listHeightWithoutScale * 0.88,
		height: layout.listHeightWithoutScale * 0.88,
		margin: layout.listHeightWithoutScale * 0.06,
		borderRadius: 4.5,
	},
	separator: {
		marginVertical: 30,
		height: 1,
		width: '80%',
	},
});
