import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability } from 'react-native-track-player';

import { Music, WeightedMusic, Track, History } from "../types";
import { complementTracks, getMoreTracks } from './Creater';

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

	static async createAndPlayNewTracks(item?: WeightedMusic) {
		if (Player.weightedMusicList.length === 1) {
			Player.tracks = [{ ...Player.weightedMusicList[0], isPlayed: false, isTrigger: true }];
		} else {
			if (item == null) {
				Player.tracks = complementTracks([], Player.weightedMusicList);
			} else {
				Player.tracks = complementTracks([{ ...item, isPlayed: false, isTrigger: false }], Player.weightedMusicList);
			}
		}

		await TrackPlayer.reset();
		await TrackPlayer.add(Player.tracks);
		await TrackPlayer.play();
	}

	static async appendMoreTracks(currentTrackPlayerIndex: number) {
		const tracksToBeAppended = getMoreTracks(Player.tracks, Player.weightedMusicList);
		Player.tracks = [...Player.tracks, ...tracksToBeAppended];
		await TrackPlayer.add(tracksToBeAppended);
		Player.tracks[currentTrackPlayerIndex].isTrigger = false;
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
