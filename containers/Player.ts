import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability, Event, State, usePlaybackState, useProgress, useTrackPlayerEvents } from 'react-native-track-player';
import * as RNFS from 'react-native-fs';

import { Music, Track, Action, History } from "../types";
import music from "../assets/data";

const jsmediatags = require('jsmediatags');

export default class Player {
	static musicList: Music[] = music.sort((a, b) => (a.title >= b.title) ? 1 : -1);
	static playlist: Track[];
	static currentIndex = 0;
	static isPlaying = false;

	static actions: Action[];
	static histories: History[];

	static uiWeightedMusicList: Music[];

	static async getMusicFiles() {
		const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);

		for (const file of files) {
			const metadata: any = await Player.readMetadata(file);
			// const pictureData = await Player.getPictureData(metadata);
			Player.musicList.unshift({
				url: file.path,
				title: metadata.tags.title,
				artist: metadata.tags.artist,
				// artwork: pictureData,
				artwork: require('../assets/artworks/pexels-josh-sorenson-737552.jpg'),
				id: file.path,
			})
		}
	}

	static readMetadata(file: any) {
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

	static getPictureData(metadata: any) {
		return new Promise((resolve, reject) => {
			const { data } = metadata.tags.picture;
			let base64String = "";
			for (let i = 0; i < data.length; i++) {
				base64String += String.fromCharCode(data[i]);
			}
			resolve({uri: `data:${data.format};base64,${window.btoa(base64String)}`});
			reject("getPictureData is rejected.");
		})
	}

	static async setupPlayer() {
		const currentTrack = await TrackPlayer.getCurrentTrack();
		if (currentTrack !== null) {
			return;
		}

		await TrackPlayer.setupPlayer({});
		await TrackPlayer.updateOptions({
			stopWithApp: false,
			capabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SeekTo,
				Capability.SkipToNext,
				Capability.SkipToPrevious,
			],
			compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SeekTo],
		});

		await TrackPlayer.add(Player.musicList);
	}

	static async getStoredData() {
		let playlist = [];
		let actions = [];
		let histories = [];

		try {

		} catch (e) {
			console.log(e);
		}

		// Player.playlist = playlist;
	}

	static async play() {
		await TrackPlayer.play();
	}


}
