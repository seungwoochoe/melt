import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability, Event, State, usePlaybackState, useProgress, useTrackPlayerEvents } from 'react-native-track-player';

import { Music, Track, Action, History } from "../types";

export default class Player {
	static musicList: Music[] = [];
	static playlist: Track[];
	static currentIndex = 0;
	static isPlaying = false;

	static actions: Action[];
	static histories: History[];

	static uiWeightedMusicList: Music[];


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
