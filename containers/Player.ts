import AsyncStorage from '@react-native-async-storage/async-storage';
import TrackPlayer, { Capability, RepeatMode } from 'react-native-track-player';

import { Music, Track, History } from "../types";
import { complementTracks, getMoreTracks, weightMusicList } from './Creater';
import cloneDeep from 'lodash.clonedeep';

const defaultMiniArt = require('../assets/images/blank.png');


export default class Player {
	static isSetup = false;

	static defaultMusic: Music = { url: 'loading', title: 'No songs found.', artist: '', artwork: defaultMiniArt, miniArt: defaultMiniArt, lyrics: "", isLiked: false, id: 'blankTrack', weight: 1 }
	static musicList: Music[] = [];

	static tracks: Track[] = [];
	static currentIndex = 0;

	static historyList: History[] = [];

	static homeSongs: Music[] = [];
	static musicSelection: Music[] = [];
	static likedSongs: Music[] = [];
	static topSongs: Music[] = [];

	static currentReasonStart: "normal" | "selected" | "returned" = "normal";
	static currentReasonEnd: "normal" | "skipped" | "interrupted";
	static currentDuration = 0;


	static async setupPlayer() {
		if (Player.isSetup) {
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

		Player.isSetup = true;
		await TrackPlayer.add(Player.tracks);
	}


	static async createNewTracks(item?: Music) {
		if (Player.musicList.length === 1) {
			Player.currentReasonEnd = "normal";
			Player.tracks = [{ ...Player.musicList[0], isPlayed: false, isTrigger: true }];
			Player.currentReasonStart = "normal";
		}
		else {
			if (item == null) {
				Player.currentReasonEnd = "skipped";
				Player.tracks = await complementTracks([], cloneDeep(Player.musicList));
				Player.currentReasonStart = "normal";
			}
			else {
				Player.currentReasonEnd = "interrupted";
				Player.tracks = await complementTracks([{ ...item, isPlayed: false, isTrigger: false }], cloneDeep(Player.musicList));
				Player.currentReasonStart = "selected";
			}
		}

		await Player.storeHistory();

		Player.currentIndex = 0;
		await TrackPlayer.reset();
		await TrackPlayer.add(Player.tracks);
	}


	static async appendMoreTracks() {
		Player.musicList = await weightMusicList(cloneDeep(Player.musicList), Player.historyList);
		const tracksToBeAppended = await getMoreTracks(cloneDeep(Player.tracks), cloneDeep(Player.musicList));
		Player.tracks = [...Player.tracks, ...tracksToBeAppended];
		await TrackPlayer.add(tracksToBeAppended);
		Player.tracks[Player.currentIndex].isTrigger = false;
	}



	// ----------------------------------------------------------------------------------
	// Functions regarding playback.

	static async play() {
		await TrackPlayer.play();
	}


	static async pause() {
		await TrackPlayer.pause();
		// console.table(Player.musicList.map(element => ({title: element.title, weight: element.weight})));
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
		Player.tracks[Player.currentIndex].isPlayed = true;
		await Player.storeHistory();

		Player.currentIndex += 1;
		Player.currentReasonStart = "normal";
		await TrackPlayer.skipToNext();

		const isRepeating = await TrackPlayer.getRepeatMode(); // Don't know why this is needed, but it is.
		if (isRepeating === RepeatMode.Track) {
			await TrackPlayer.play();
		}

		if (!!Player.tracks[Player.currentIndex].isTrigger) {
			await Player.appendMoreTracks();
		}
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
						// console.warn(e);
					}
				}

				Player.currentIndex -= 1;
				Player.tracks[Player.currentIndex].isPlayed = false;
				Player.currentReasonStart = "returned"
				await TrackPlayer.skipToPrevious();

				const isRepeating = await TrackPlayer.getRepeatMode(); // Don't know why this is needed, but it is.
				if (isRepeating === RepeatMode.Track) {
					await TrackPlayer.play();
				}
			}
			else {
				await TrackPlayer.seekTo(0);
			}
		}
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
			// console.warn(e);
		}
	}


	static async storeHistory() {
		let secPlayed = 0;
		try {
			const jsonValue = await AsyncStorage.getItem('secPlayed');
			secPlayed = jsonValue != null ? (Number(JSON.parse(jsonValue))) : 0;
		} catch (e) {
			// console.warn(e);
		}

		let playedRatio = Player.currentDuration === 0 ? 0 : (secPlayed / Player.currentDuration);
		if (playedRatio !== 0 && Math.abs(secPlayed - Player.currentDuration) < 7) {
			playedRatio = 1;
		}

		Player.historyList.push({
			endTime: Date.now(),
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
			// console.warn(e);
		}
	}




	// --------------------------------------------------------------------
	// For Search srceen.

	static async updateMusicSelection(music: Music) {
		while (Player.musicSelection.length > Math.min(20, Math.max(12, Math.floor(Player.musicList.length / 10)))) {
			Player.musicSelection.pop();
		}

		const duplicateIndex = Player.musicSelection.findIndex(element => element.title === music.title);
		if (duplicateIndex !== -1) { // There is already selected song on the list.
			Player.musicSelection.splice(duplicateIndex, 1);
		}

		Player.musicSelection.unshift(music);

		try {
			const jsonValue = JSON.stringify(Player.musicSelection);
			await AsyncStorage.setItem('musicSelection', jsonValue);
		} catch (e) {
			// console.warn(e);
		}
	}


	// -------------------------------------------------------------------------
	// For Home screen
	static updateSongsForHomeScreen() {
		const listLength = Math.min(Player.musicList.length, Math.min(20, Math.max(12, Math.floor(Player.musicList.length / 10))));
		const homeSongs: Music[] = [];
		const portionOfTopSongs = 0.3;
		const portionOfLikedSong = 0.3;
		const portionOfLightestSongs = 0.1;

		// let top = 0;
		// let liked = 0;
		// let lightest = 0;
		// let ect = 0;

		// let one = 0;
		// let two = 0;
		// let three = 0;
		// let four = 0;

		while (homeSongs.length < listLength) {
			const randNumber = Math.random();

			if (0 <= randNumber && randNumber < portionOfTopSongs && Player.topSongs.length > 0) {
				// one++;
				const randIndex = Math.floor(Math.random() * Player.topSongs.length);
				if (homeSongs.findIndex(element => element.id === Player.topSongs[randIndex].id) === -1) {
					homeSongs.push(Player.topSongs[randIndex]);
					// top++;
				}
			}
			else if (portionOfTopSongs <= randNumber && randNumber < (portionOfTopSongs + portionOfLikedSong) && Player.likedSongs.length > 0) {
				// two++;
				const randIndex = Math.floor(Math.random() * Player.likedSongs.length);
				if (homeSongs.findIndex(element => element.id === Player.likedSongs[randIndex].id) === -1) {
					homeSongs.push(Player.likedSongs[randIndex]);
					// liked++;
				}
			}
			else if ((portionOfTopSongs + portionOfLikedSong) <= randNumber && randNumber < (portionOfTopSongs + portionOfLikedSong + portionOfLightestSongs)) {
				// three++;
				const lightestSongs = cloneDeep(Player.musicList).sort((a, b) => a.weight - b.weight).slice(0, Math.floor(Player.musicList.length / 10));

				const randIndex = Math.floor(Math.random() * lightestSongs.length);
				if (homeSongs.findIndex(element => element.id === lightestSongs[randIndex].id) === -1) {
					homeSongs.push(lightestSongs[randIndex]);
					// lightest++;
				}
			}
			else {
				// four++;
				const randIndex = Math.floor(Math.random() * Player.musicList.length);
				if (homeSongs.findIndex(element => element.id === Player.musicList[randIndex].id) === -1) {
					homeSongs.push(Player.musicList[randIndex]);
					// ect++;
				}
			}
		}
		// console.log("chance", one, two, three, four);
		// console.log("top", top, "liked", liked, "lightest", lightest, "ect.", ect);

		Player.homeSongs = Player.shuffleArray(cloneDeep(homeSongs));
	}

	/* Randomize array in-place using Durstenfeld shuffle algorithm */
	static shuffleArray(array: any[]) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}

		return array;
	}




	// -------------------------------------------------------------------------
	// For Libraray screen
	static updateTopMusic() {
		const topSongs: Music[] = [];
		const stats: { id: string, playedAmount: number }[] = [];

		const aWeekEarlier = Date.now() - 7 * 24 * 60 * 60 * 1000;
		const aMonthEarlier = Date.now() - 30 * 24 * 60 * 60 * 1000;

		let historyList = [...Player.historyList].filter(element => element.endTime > aWeekEarlier); // 🤦 Copying vs Referencing!! I spent 1-2 hours because of this..

		if (historyList.length < 30) {
			historyList = [...Player.historyList].filter(element => element.endTime > aMonthEarlier);
		}

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

		for (let i = 0; i < Math.min(sortedStats.length, Math.min(20, Math.max(12, Math.floor(Player.musicList.length / 12)))); i++) {
			const targetMusic = Player.musicList.find((element) => element.id === sortedStats[i].id);

			if (targetMusic != null) {
				topSongs.push(targetMusic);
			}
		}

		Player.topSongs = topSongs;
	}
}
