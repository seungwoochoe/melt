import * as RNFS from 'react-native-fs';
import * as jsmediatags from 'jsmediatags'
import base64 from 'react-native-base64';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Music } from '../types';

const defaultArtwork = require('../assets/images/blank.png');


export async function readMusicFiles() {
	let storedMusicList: Music[] | null = null;

	try {
		const jsonValue = await AsyncStorage.getItem('musicList');
		storedMusicList = jsonValue != null ? JSON.parse(jsonValue) : null;
	} catch (e) {
		console.log("Reader.ts: Error occurred while reading data.", e);
	}

	const musicList: Music[] = [];
	const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);

	for (const file of files) {
		const id = file.path.split('Documents/').pop();

		if (storedMusicList != null) {
			const match = storedMusicList.find(item => item.id === id);
			// console.log(match == null ? "😢 Not found" : "🎉 Found music from storedMusicList!!");

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
						title: file.path.split('/').pop()?.split('.')[0] ?? "Nullish Coalescing",
						artist: "",
						artwork: defaultArtwork,
						id: id ?? file.path,
					});
				} else {
					musicList.push({
						url: file.path,
						title: metadata.tags.title ?? file.path.split('/').pop()?.split('.')[0],
						artist: metadata.tags.artist ?? "",
						artwork: metadata.tags.picture == null ? defaultArtwork : generatePictureData(metadata),
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
					title: file.path.split('/').pop()?.split('.')[0] ?? "Nullish Coalescing",
					artist: "",
					artwork: defaultArtwork,
					id: id ?? file.path,
				});
			} else {
				musicList.push({
					url: file.path,
					title: metadata.tags.title ?? file.path.split('/').pop()?.split('.')[0],
					artist: metadata.tags.artist ?? "",
					artwork: metadata.tags.picture == null ? defaultArtwork : generatePictureData(metadata),
					id: id ?? file.path,
				});
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

function generatePictureData(metadata: any) {
	const data = metadata.tags.picture.data;
	let base64String = "";
	for (let i = 0; i < data.length; i++) {
		base64String += String.fromCharCode(data[i]);
	}
	return `data:${data.format};base64,${base64.encode(base64String)}`;
}
