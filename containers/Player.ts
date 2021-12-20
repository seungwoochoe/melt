import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability } from 'react-native-track-player';

import { Music, WeightedMusic, Track, History } from "../types";
import { complementTracks, getMoreTracks } from './Creater';


export default class Player {
	static musicList: Music[] = [];
	static weightedMusicList: WeightedMusic[] = [];

	static tracks: Track[] = [];
	static currentIndex = 0;

	static historyList: History[] = [];
	static musicSelection: Music[] = [];
	static likedSongs: Music[] = [];
	static mostPlayedSongs: Music[] = [];
	static libraryItemsListSize = Math.max(12, Math.floor(Player.musicList.length / 10));

	static currentReasonStart: "normal" | "selected" | "returned" = "normal";
	static currentReasonEnd: "normal" | "skipped";
	static currentDuration = 10000;
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
			compactCapabilities: [
				Capability.Play,
				Capability.Pause,
				Capability.SkipToNext,
				Capability.SkipToPrevious,
				Capability.SeekTo
			],
		});
		await TrackPlayer.add(Player.tracks);
	}


	static async createNewTracks(item?: Music) {
		Player.currentReasonEnd = "skipped";
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

		Player.currentIndex = 0;
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
		await TrackPlayer.play();
		Player.isPlaying = true;
	}


	static async pause() {
		await TrackPlayer.pause();
		Player.isPlaying = false;
	}


	static async handlePlayNext() {
		Player.currentReasonEnd = "normal"
		await Player.storeHistory();

		Player.tracks[Player.currentIndex].isPlayed = true;
		Player.currentIndex += 1;
		Player.currentReasonStart = "normal";

		if (!!Player.tracks[Player.currentIndex].isTrigger) {
			await Player.appendMoreTracks();
		}
	}


	static async skipToNext() {
		Player.currentReasonEnd = "skipped";
		await Player.storeHistory();

		Player.tracks[Player.currentIndex].isPlayed = true;
		Player.currentIndex += 1;
		Player.currentReasonStart = "normal";
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
				if (Player.historyList[Player.historyList.length - 1].reasonEnd === "skipped") {
					Player.historyList.pop();

					try { // Save pruned history.
						const jsonValue = JSON.stringify(Player.historyList);
						await AsyncStorage.setItem('historyList', jsonValue);
					} catch (e) {
						// console.log(e);
					}
				}

				Player.currentIndex -= 1;
				Player.tracks[Player.currentIndex].isPlayed = false;
				Player.currentReasonStart = "returned"
				await TrackPlayer.skipToPrevious();
			}
			else {
				await TrackPlayer.seekTo(0);
			}
		}

		Player.isPlaying = true;
	}


	static async seekTo(position: number) {
		await TrackPlayer.seekTo(position);
		await TrackPlayer.pause();
		await TrackPlayer.play();
	}


	static async storeTracksStatus() {
		try {
			const jsonValue = JSON.stringify(Player.tracks);
			await AsyncStorage.setItem('tracks', jsonValue);
		} catch (e) {
			// console.log(e);
		}
	}

	static async storeHistory() {
		let secPlayed = 0;
		try {
			const jsonValue = await AsyncStorage.getItem('secPlayed');
			secPlayed = jsonValue != null ? (Number(JSON.parse(jsonValue))) : 0;
		} catch (e) {
			// console.log(e);
		}

		let playedRatio = secPlayed / Player.currentDuration;
		if (Math.abs(secPlayed - Player.currentDuration) < 7) {
			playedRatio = 1;
		}

		Player.historyList.push({
			endTime: Date.now(),
			url: Player.tracks[Player.currentIndex].url,
			title: Player.tracks[Player.currentIndex].title,
			artist: Player.tracks[Player.currentIndex].artist,
			miniArt: Player.tracks[Player.currentIndex].miniArt,
			isLiked: Player.tracks[Player.currentIndex].isLiked,
			id: Player.tracks[Player.currentIndex].id,
			reasonStart: Player.currentReasonStart,
			reasonEnd: Player.currentReasonEnd,
			playedRatio: playedRatio,
			secPlayed: secPlayed,
			duration: Player.currentDuration,
		});

		try {
			const jsonValue = JSON.stringify(Player.historyList);
			await AsyncStorage.setItem('historyList', jsonValue);
		} catch (e) {
			// console.log(e);
		}

		const log = Player.historyList.map((element) => (
			{
				title: element.title,
				// reasonStart: element.reasonStart,
				// reasonEnd: element.reasonEnd,
				playedRatio: element.playedRatio,
				secPlayed: element.secPlayed,
				duration: element.duration,
			}
		));
		console.table(log);
	}





	// --------------------------------------------------------------------
	// For Search srceen.

	static async updateMusicSelection(music: Music) {
		while (Player.musicSelection.length > Player.libraryItemsListSize) {
			Player.musicSelection.pop();
		}

		const duplicateIndex = Player.musicSelection.findIndex(element => element.title === music.title);
		if (duplicateIndex !== -1) {
			Player.musicSelection.splice(duplicateIndex, 1);
		}

		Player.musicSelection.unshift(music);

		try {
			const jsonValue = JSON.stringify(Player.musicSelection);
			await AsyncStorage.setItem('musicSelection', jsonValue);
		} catch (e) {
			// console.log(e);
		}
	}




	// -------------------------------------------------------------------------
	// For Libraray screen
	static updateMostPlayedMusic() {
		const mostPlayedSongs: Music[] = [];
		const stats: { id: string, playedAmount: number }[] = [];
		const historyList = Player.historyList;
		
		historyList.reverse(); // In order to dispaly recently songs first if there are songs with same playedAmount.

		for (const history of historyList) {
			const targetIndex = stats.findIndex(element => element.id === history.id)

			if (targetIndex === -1) {
				stats.push({
					id: history.id,
					playedAmount: history.playedRatio,
				})
			}
			else {
				stats[targetIndex].playedAmount += history.playedRatio;
			}
		}

		const sortedStats = stats.sort((a, b) => b.playedAmount - a.playedAmount);

		for (let i = 0; i < Math.min(sortedStats.length, Player.libraryItemsListSize); i++) {
			const targetMusic = Player.musicList.find((element) => element.id === sortedStats[i].id);

			if (targetMusic != null) {
				mostPlayedSongs.push(targetMusic);
			}
		}

		Player.mostPlayedSongs = mostPlayedSongs;
	}
}
