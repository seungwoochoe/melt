import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability } from 'react-native-track-player';

import { Music, WeightedMusic, Track,  History } from "../types";

export default class Player {
	static musicList: Music[] = [];
	static weightedMusicList: WeightedMusic[];
	static tracks: Track[] = [];
	static currentIndex = 0;
	static currentTrack: Track;
	static isPlaying = false;

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
			compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious, Capability.SeekTo],
		});

		await TrackPlayer.add(Player.tracks);
	}

	static async skipToNext() {
		await Player.playNext();
	}

	static async playNext() {
		Player.currentIndex += 1;
		await TrackPlayer.skipToNext();
	}

	static async skipToPrevious() {
		Player.currentIndex -= 1;
		await TrackPlayer.skipToPrevious();
	}
}
