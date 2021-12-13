import * as RNFS from 'react-native-fs';
import * as jsmediatags from 'jsmediatags'
import base64 from 'react-native-base64';
import { Music } from '../types';
import Player from './Player';


export async function readMusicFiles() {
	const musicList: Music[] = [];
	const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);

	for (const file of files) {
		const metadata: any = await readMetadata(file);
		const pictureData = generatePictureData(metadata);

		musicList.push({
			url: file.path,
			title: metadata.tags.title,
			artist: metadata.tags.artist,
			artwork: pictureData,
			// artwork: require('../assets/images/blank.png'),
			id: file.path,
		})
		console.log("added track");
	};

	Player.musicList = musicList.sort((a, b) => (a.title >= b.title) ? 1 : -1);
	await Player.setupPlayer();
	console.log("player set up.");
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
	return ({ uri: `data:${data.format};base64,${base64.encode(base64String)}` });
}
