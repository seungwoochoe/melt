import * as RNFS from 'react-native-fs';
import * as jsmediatags from 'jsmediatags'
import base64 from 'react-native-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';

import { Music, Track, History } from '../types';

const defaultArtwork = require('../assets/images/blank.png');
const documentDirectory = RNFS.DocumentDirectoryPath;

export async function readMusicFiles(artworkSize: number, miniArtSize: number) {
	let isThereAnyChangeOnMusicList = false;
	let storedMusicList: Music[] | null = null;

	try {
		const jsonValue = await AsyncStorage.getItem('musicList');
		storedMusicList = jsonValue != null ? JSON.parse(jsonValue) : null;
	} catch (e) {
		// console.log(e);
	}


	const musicList: Music[] = [];
	const files = await RNFS.readDir(documentDirectory);

	for (const file of files) {
		if (file.path.includes('Documents/assets')) {
			// This is the asset folder. Do nothing.
		}
		else {
			const id = file.path.split('Documents/').pop();

			if (storedMusicList != null) {
				const match = storedMusicList.find(item => item.id === id);

				if (match != null) {
					musicList.push(match);
				}
				else {
					let metadata: any;
					try {
						metadata = await readMetadata(file);
					} catch {
						metadata = false;
					}

					if (metadata === false) {
						musicList.push({
							url: file.path,
							title: id?.substring(0, id.lastIndexOf('.')) ?? "Nullish Coalescing",
							artist: "",
							artwork: defaultArtwork,
							miniArt: defaultArtwork,
							id: id ?? file.path,
						});
					}
					else {
						musicList.push({
							url: file.path,
							title: metadata.tags.title ?? id?.substring(0, id.lastIndexOf('.')),
							artist: metadata.tags.artist ?? "",
							artwork: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, artworkSize),
							miniArt: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, miniArtSize),
							id: id ?? file.path,
						});
					}
				}
			}
			else { // There is no stored music data.
				let metadata: any;
				try {
					metadata = await readMetadata(file);
				} catch {
					metadata = false;
				}

				if (metadata === false) {
					musicList.push({
						url: file.path,
						title: id?.substring(0, id.lastIndexOf('.')) ?? "Nullish Coalescing",
						artist: "",
						artwork: defaultArtwork,
						miniArt: defaultArtwork,
						id: id ?? file.path,
					});
				}
				else {
					musicList.push({
						url: file.path,
						title: metadata.tags.title ?? id?.substring(0, id.lastIndexOf('.')),
						artist: metadata.tags.artist ?? "",
						artwork: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, artworkSize),
						miniArt: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, miniArtSize),
						id: id ?? file.path,
					});
				}
			}
		}
	};

	const sortedMusiclist = musicList.sort((a, b) => (a.title.toLowerCase() >= b.title.toLowerCase()) ? 1 : -1);

	try {
		const jsonValue = JSON.stringify(sortedMusiclist);
		await AsyncStorage.setItem('musicList', jsonValue);
	} catch (e) {
		// console.log(e);
	}

	return sortedMusiclist;
}


function readMetadata(file: any) {
	return new Promise((resolve, reject) => {
		new jsmediatags.Reader(file.path)
			.read({
				onSuccess: (metadata: any) => {
					resolve(metadata);
				},
				onError: (e: any) => {
					reject(e);
				}
			});
	});
}

async function generateImageData(metadata: any, imageSize: number) {
	const data = metadata.tags.picture.data;
	let base64String = "";

	for (let i = 0; i < data.length; i++) {
		base64String += String.fromCharCode(data[i]);
	}

	const compressedImage = await compressPicture(`data:${data.format};base64,${base64.encode(base64String)}`, imageSize);
	return compressedImage;
}

function compressPicture(source: string, imageSize: number) {
	return new Promise((resolve) => {
		ImageResizer.createResizedImage(
			source,
			imageSize,
			imageSize,
			'JPEG',
			100,
			0,
			documentDirectory + '/assets',
			false,
			{ onlyScaleDown: true },
		)
			.then(resizedImage => {
				resolve(resizedImage.path);
			})
			.catch(e => {
				// console.log(e);
			})
	})
}



// Returns pruned stored tracks.
export async function pruneStoredTracks() {
	let tracks: Track[] | null = null;

	try {
		const jsonValue = await AsyncStorage.getItem('tracks');
		tracks = jsonValue != null ? JSON.parse(jsonValue) : null;
	} catch (e) {
		// console.log(e);
	}

	if (tracks == null) {
		return [];
	}

	return pruneTracks(tracks);
}

function pruneTracks(tracks: Track[]) {
	const isNotPlayed = (track: Track) => track.isPlayed === false;
	const isNotPlayedIndex = tracks.findIndex(isNotPlayed);
	return tracks.slice(isNotPlayedIndex);
}


export async function getStoredHistories() {
	let histories: History[] = [];

	try {
		const jsonValue = await AsyncStorage.getItem('histories');
		histories = jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// console.log(e);
	}
	return histories;
}


export async function getStoredMusicSelection() {
	let musicSelection: Music[] = [];

	try {
		const jsonValue = await AsyncStorage.getItem('musicSelection');
		musicSelection = jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// console.log(e);
	}
	return musicSelection;
}
