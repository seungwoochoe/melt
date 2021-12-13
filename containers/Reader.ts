import * as RNFS from 'react-native-fs';
import * as jsmediatags from 'jsmediatags'
import base64 from 'react-native-base64';
import { Music } from '../types';
import Player from './Player';


export async function readMusicFiles() {
	const musicList: Music[] = [];
	const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);

	for (const file of files) {
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
				artwork: require('../assets/images/blank.png'),
				id: file.path,
			});
		} else {
			musicList.push({
				url: file.path,
				title: metadata.tags.title ?? file.path.split('/').pop()?.split('.')[0],
				artist: metadata.tags.artist ?? "",
				artwork: metadata.tags.picture == null ? require('../assets/images/blank.png') : generatePictureData(metadata),
				id: file.path,
			});
		}
		console.log("added track");
	};

	return musicList.sort((a, b) => (a.title.toLowerCase() >= b.title.toLowerCase()) ? 1 : -1);
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
