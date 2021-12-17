import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability } from 'react-native-track-player';

import { Music, WeightedMusic, Track, History } from "../types";
import { complementTracks, getMoreTracks } from './Creater';

export default class Player {
	static musicList: Music[] = [];
	static weightedMusicList: WeightedMusic[] = [];

	static tracks: Track[] = [];
	static currentIndex = 0;

	static histories: History[] = [];

	static currentReasonStart: "normal" | "selected" | "returned" = "normal";
	static currentReasonEnd: "normal" | "skipped";
	static currentDuration = 10000;
	static currentMsPlayed = 0;
	static currentPlayStartTime = 0;
	static isPlaying = false;


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

		try {
			const jsonValue = await AsyncStorage.getItem('histories');
			Player.histories = jsonValue != null ? JSON.parse(jsonValue) : [];
		} catch (e) {
			console.log(e);
		}

		await TrackPlayer.add(Player.tracks);
	}


	static async createNewTracks(item?: WeightedMusic) {
		Player.currentReasonEnd = "skipped";
		Player.currentMsPlayed = Player.isPlaying ? (Player.currentMsPlayed + (Date.now() - Player.currentPlayStartTime)) : Player.currentMsPlayed;
		await Player.storeHistory();

		if (Player.weightedMusicList.length === 1) {
			Player.tracks = [{ ...Player.weightedMusicList[0], isPlayed: false, isTrigger: true }];
			Player.currentReasonStart = "normal";
		}
		else {
			if (item == null) {
				Player.tracks = complementTracks([], Player.weightedMusicList);
				Player.currentReasonStart = "normal";
			}
			else {
				Player.tracks = complementTracks([{ ...item, isPlayed: false, isTrigger: false }], Player.weightedMusicList);
				Player.currentReasonStart = "selected";
			}
		}

		Player.currentReasonEnd = "normal";
		Player.currentIndex = 0;
		Player.currentMsPlayed = 0;
		await TrackPlayer.reset();
		await TrackPlayer.add(Player.tracks);
	}


	static async appendMoreTracks() {
		const tracksToBeAppended = getMoreTracks(Player.tracks, Player.weightedMusicList);
		Player.tracks = [...Player.tracks, ...tracksToBeAppended];
		await TrackPlayer.add(tracksToBeAppended);
		Player.tracks[Player.currentIndex].isTrigger = false;


	}



	// ----------------------------------------------------------------------------------
	// Functions regarding playback.

	static async play() {
		Player.currentPlayStartTime = Date.now();
		await TrackPlayer.play();
		Player.isPlaying = true;
	}


	static async pause() {
		Player.currentMsPlayed += Date.now() - Player.currentPlayStartTime;
		await TrackPlayer.pause();
		Player.isPlaying = false;
	}


	static async handlePlayNext() {
		Player.currentMsPlayed += Date.now() - Player.currentPlayStartTime;
		await Player.storeHistory();

		Player.tracks[Player.currentIndex].isPlayed = true;
		Player.currentIndex += 1;
		Player.currentReasonStart = "normal";
		Player.currentReasonEnd = "normal";
		Player.currentMsPlayed = 0;
		Player.currentPlayStartTime = Date.now();

		if (!!Player.tracks[Player.currentIndex].isTrigger) {
			await Player.appendMoreTracks();
		}
	}


	static async skipToNext() {
		Player.currentReasonEnd = "skipped";
		Player.currentMsPlayed = Player.isPlaying ? (Player.currentMsPlayed + (Date.now() - Player.currentPlayStartTime)) : Player.currentMsPlayed;
		await Player.storeHistory();

		Player.tracks[Player.currentIndex].isPlayed = true;
		Player.currentIndex += 1;
		Player.currentReasonStart = "normal";
		Player.currentReasonEnd = "normal";
		Player.currentMsPlayed = 0;
		Player.currentPlayStartTime = Date.now();
		await TrackPlayer.skipToNext();
		Player.isPlaying = true;

		if (!!Player.tracks[Player.currentIndex].isTrigger) {
			await Player.appendMoreTracks();
		}

		// console.log("⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️⭐️");
		// for (const [i, track] of Player.tracks.entries()) {
		// 	console.log(i, track.isPlayed, track.title);
		// }
	}


	static async skipToPrevious(currentPosition: number) {
		if (Player.currentIndex === 0) {
			await TrackPlayer.seekTo(0);
		}
		else {
			const skipToPreviousTrackThreshold = 5;

			if (currentPosition < skipToPreviousTrackThreshold) {
				if (Player.histories[Player.histories.length - 1].reasonEnd === "skipped") {
					Player.histories.pop();

					try { // Save pruned history.
						const jsonValue = JSON.stringify(Player.histories);
						await AsyncStorage.setItem('histories', jsonValue);
					} catch (e) {
						console.log(e);
					}
				}

				Player.currentIndex -= 1;
				Player.tracks[Player.currentIndex].isPlayed = false;
				Player.currentReasonStart = "returned"
				Player.currentReasonEnd = "normal";
				Player.currentMsPlayed = 0;
				Player.currentPlayStartTime = Date.now();
				await TrackPlayer.skipToPrevious();
			}
			else {
				await TrackPlayer.seekTo(0);
			}
		}

		Player.isPlaying = true;
	}


	static async storeTracks() {
		try {
			const jsonValue = JSON.stringify(Player.tracks);
			await AsyncStorage.setItem('tracks', jsonValue);
		} catch (e) {
			console.log(e);
		}
	}

	static async storeHistory() {
		Player.histories.push({
			endTime: Date.now(),
			url: Player.tracks[Player.currentIndex].url,
			title: Player.tracks[Player.currentIndex].title,
			artist: Player.tracks[Player.currentIndex].artist,
			artwork: Player.tracks[Player.currentIndex].artwork,
			miniArt: Player.tracks[Player.currentIndex].miniArt,
			id: Player.tracks[Player.currentIndex].id,
			reasonStart: Player.currentReasonStart,
			reasonEnd: Player.currentReasonEnd,
			playedRatio: Player.currentMsPlayed / (Player.currentDuration * 1000),
		});

		try {
			const jsonValue = JSON.stringify(Player.histories);
			await AsyncStorage.setItem('histories', jsonValue);
		} catch (e) {
			console.log(e);
		}
	}
}
