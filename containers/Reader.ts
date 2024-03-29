import * as RNFS from 'react-native-fs';
import * as jsmediatags from 'jsmediatags'
import base64 from 'react-native-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';
import React from 'react'; // Needed if you want to use react-native.
import { Dimensions } from 'react-native';

import { Music, Track, History } from '../types';
import Player from './Player';

const { width } = Dimensions.get('screen');
const artworkSize = Math.floor(width * 1.8);
const miniArtSize = width * 0.4;

const defaultArtwork = require('../assets/images/blank.png');
const documentDirectory = RNFS.DocumentDirectoryPath;


export async function readMusicFiles() {
	let storedMusicList: Music[] = [];

	try {
		const jsonValue = await AsyncStorage.getItem('musicList');
		storedMusicList = jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// console.warn(e);
	}

	let averageWeight = 1;

	if (storedMusicList.length !== 0) {
		let totalWeight = 0;

		for (const music of storedMusicList) {
			totalWeight += music.weight;
		}
		averageWeight = totalWeight / storedMusicList.length;
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
						metadata = await readMetadata(file.path);
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
							lyrics: "",
							isLiked: false,
							id: id ?? file.path,
							weight: averageWeight,
						});
					}
					else {
						musicList.push({
							url: file.path,
							title: metadata.tags.title ?? id?.substring(0, id.lastIndexOf('.')),
							artist: metadata.tags.artist ?? "",
							artwork: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, artworkSize),
							miniArt: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, miniArtSize),
							lyrics: metadata.tags.lyrics?.lyrics ?? "",
							isLiked: false,
							id: id ?? file.path,
							weight: averageWeight,
						});
					}
				}
			}
			else { // There is no stored music data.
				let metadata: any;
				try {
					metadata = await readMetadata(file.path);
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
						lyrics: "",
						isLiked: false,
						id: id ?? file.path,
						weight: averageWeight,
					});
				}
				else {
					musicList.push({
						url: file.path,
						title: metadata.tags.title ?? id?.substring(0, id.lastIndexOf('.')),
						artist: metadata.tags.artist ?? "",
						artwork: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, artworkSize),
						miniArt: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, miniArtSize),
						lyrics: metadata.tags.lyrics?.lyrics ?? "",
						isLiked: false,
						id: id ?? file.path,
						weight: averageWeight,
					});
				}
			}
		}
	};

	const sortedMusicList = musicList.sort((a, b) => (a.title.toLowerCase() >= b.title.toLowerCase()) ? 1 : -1);

	return sortedMusicList;
}


function readMetadata(path: string) {
	return new Promise((resolve, reject) => {
		new jsmediatags.Reader(path)
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
				// console.warn(e);
			})
	})
}



// Returns pruned stored tracks.
export async function pruneStoredTracks() {
	let tracks: Track[] = [];

	try {
		const jsonValue = await AsyncStorage.getItem('tracks');
		tracks = jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// console.warn(e);
	}

	return pruneTracks(tracks);
}


function pruneTracks(tracks: Track[]) {
	const isNotPlayed = (track: Track) => track.isPlayed === false;
	const isNotPlayedIndex = tracks.findIndex(isNotPlayed);
	return tracks.slice(isNotPlayedIndex);
}


export async function getStoredHistoryList() {
	let historyList: History[] = [];

	try {
		const jsonValue = await AsyncStorage.getItem('historyList');
		historyList = jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// console.warn(e);
	}
	return historyList;
}


export async function getStoredMusicSelection() {
	let musicSelection: Music[] = [];
	const prunedMusicSelection: Music[] = [];

	try {
		const jsonValue = await AsyncStorage.getItem('musicSelection');
		musicSelection = jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// console.warn(e);
	}

	for (const music of musicSelection) {
		const targetIndex = Player.musicList.findIndex(element => element.id === music.id);

		if (targetIndex !== -1) {
			prunedMusicSelection.push(Player.musicList[targetIndex]);
		}
	}
	return prunedMusicSelection;
}


export async function getStoredLikedSongs() {
	let likedSongs: Music[] = [];
	const prunedLikedSongs: Music[] = [];

	try {
		const jsonValue = await AsyncStorage.getItem('likedSongs');
		likedSongs = jsonValue != null ? JSON.parse(jsonValue) : [];
	} catch (e) {
		// console.warn(e);
	}

	for (const song of likedSongs) {
		const targetIndex = Player.musicList.findIndex(element => element.id === song.id);

		if (targetIndex !== -1) {
			prunedLikedSongs.push(Player.musicList[targetIndex]);
		}
	}

	return prunedLikedSongs;
}


export async function getMetadata(music: Music) {

	const targetUri = RNFS.DocumentDirectoryPath + '/' + music.id;

	let metadata: any;
	try {
		metadata = await readMetadata(targetUri);
	} catch (e) {
		metadata = false;
	}

	if (metadata === false) {
		return music;
	}
	else {
		return (
			{
				url: music.url,
				title: metadata.tags.title ?? music.title,
				artist: metadata.tags.artist ?? music.artist,
				artwork: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, artworkSize),
				miniArt: metadata.tags.picture == null ? defaultArtwork : await generateImageData(metadata, miniArtSize),
				lyrics: metadata.tags.lyrics?.lyrics ?? "",
				isLiked: music.isLiked,
				id: music.id,
				weight: music.weight,
			}
		)
	}
}
