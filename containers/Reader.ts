import * as RNFS from 'react-native-fs';
import * as jsmediatags from 'jsmediatags'
import base64 from 'react-native-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageResizer from 'react-native-image-resizer';

import { Music } from '../types';

const defaultArtwork = require('../assets/images/blank.png');
const documentDirectory = RNFS.DocumentDirectoryPath;

export async function readMusicFiles(thumbnailSize: number) {
	let storedMusicList: Music[] | null = null;

	try {
		const jsonValue = await AsyncStorage.getItem('musicList');
		storedMusicList = jsonValue != null ? JSON.parse(jsonValue) : null;
	} catch (e) {
		console.log("Reader.ts: Error occurred while reading data.", e);
	}

	// console.log(storedMusicList);

	const musicList: Music[] = [];
	const files = await RNFS.readDir(documentDirectory);

	for (const file of files) {
		if (file.path.includes('Documents/assets')) {
			// This is the asset folder. Do nothing.
		} else {
			const id = file.path.split('Documents/').pop();

			if (storedMusicList != null) {
				const match = storedMusicList.find(item => item.id === id);

				// if (match == null) {
				// 	console.log("😢 Not found");
				// } else {
				// 	foundCount++;
				// 	console.log(`🎉 Found ${foundCount} songs from storedMusicList!!`)
				// }

				if (match != null) {
					musicList.push(match);
				} else {
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
							id: id ?? file.path,
						});
					} else {
						musicList.push({
							url: file.path,
							title: metadata.tags.title ?? id?.substring(0, id.lastIndexOf('.')),
							artist: metadata.tags.artist ?? "",
							artwork: metadata.tags.picture == null ? defaultArtwork : await generatePictureData(metadata, true, thumbnailSize),
							id: id ?? file.path,
						});
					}
				}
			} else { // There is no stored music data.
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
						id: id ?? file.path,
					});
				} else {
					musicList.push({
						url: file.path,
						title: metadata.tags.title ?? id?.substring(0, id.lastIndexOf('.')),
						artist: metadata.tags.artist ?? "",
						artwork: metadata.tags.picture == null ? defaultArtwork : await generatePictureData(metadata, true, thumbnailSize),
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
		console.log("Reader.ts: Error occurred while storing data.", e);
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

async function generatePictureData(metadata: any, compress: boolean, thumbnailSize: number) {
	const data = metadata.tags.picture.data;
	let base64String = "";

	for (let i = 0; i < data.length; i++) {
		base64String += String.fromCharCode(data[i]);
	}

	if (compress) {
		const compressedPicture = await compressPicture(`data:${data.format};base64,${base64.encode(base64String)}`, thumbnailSize);
		return compressedPicture;
	} else {
		return `data:${data.format};base64,${base64.encode(base64String)}`
	}
}

function compressPicture(source: string, thumbnailSize: number) {
	return new Promise((resolve) => {
		ImageResizer.createResizedImage(
			source,
			thumbnailSize,
			thumbnailSize,
			'JPEG',
			100,
			0,
			documentDirectory + '/assets',
			false,
			{onlyScaleDown: true},
		).then(resizedImage => {
			resolve(resizedImage.uri);
		})
			.catch(e => {
				console.log("Error occurred while compressing picture.", e);
			})
	})
}


export async function getBigArtwork(file: string) {
	let metadata: any;
	try {
		metadata = await readMetadata(file);
	} catch {
		metadata = false;
	}

	if (metadata === false) {
		return defaultArtwork;
	} else {
		if (metadata.tags.picture == null) {
			return defaultArtwork;
		} else {
			return generatePictureData(metadata, false, 0);
		}
	};
}
