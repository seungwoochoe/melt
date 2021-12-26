import { Music, Track, History } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRACK_LENGTH = 4;
const SKIP_WEIGHT_MODIFIER = 0.15;
const BOOST_WEIGHT_MODIFIER = 1.2;


export async function weightMusicList(musicList: Music[], historyList: History[]) {
	let appliedHistoryTime = 0;

	try {
		const jsonValue = await AsyncStorage.getItem('appliedHistoryTime');
		appliedHistoryTime = jsonValue != null ? JSON.parse(jsonValue) : 0;
	} catch (e) {
		// console.log(e);
	}

	historyList = historyList.filter(element => element.endTime > appliedHistoryTime);
	console.log("filtered history list length", historyList.length);

	for (const history of historyList) {
		const targetIndex = musicList.findIndex(element => element.id === history.id);

		if (history.reasonStart === 'selected' && history.playedRatio >= 1) {
			musicList[targetIndex].weight *= BOOST_WEIGHT_MODIFIER * history.playedRatio;
		}
		else if (history.reasonStart === 'normal' && history.reasonEnd === 'skipped') {
			musicList[targetIndex].weight = musicList[targetIndex].weight * (1 - SKIP_WEIGHT_MODIFIER * Math.max(0, (1 - history.playedRatio)));
		}
	}

	if (historyList.length !== 0) {
		appliedHistoryTime = historyList[historyList.length - 1].endTime;
		try {
			const jsonValue = JSON.stringify(appliedHistoryTime);
			await AsyncStorage.setItem('appliedHistoryTime', jsonValue);
		} catch (e) {
			// console.log(e);
		}
	}
	console.log("appliedHistoryTime", appliedHistoryTime);

	return musicList;
}




// If there is no or only one music in storage, "createPlaylist" function should not be called.
export function complementTracks(currentTracks: Track[], musicList: Music[]) {
	const tracksToBeAdded = drawMusic(TRACK_LENGTH - currentTracks.length, currentTracks[currentTracks.length - 1], musicList);
	const tracks = [...currentTracks, ...tracksToBeAdded];
	return markIsTrigger(tracks);
}

export function getMoreTracks(currentTracks: Track[], musicList: Music[]) {
	if (musicList.length === 1) {
		return [{ ...musicList[0], isPlayed: false, isTrigger: true }];
	}

	const tracks = drawMusic(TRACK_LENGTH / 2, currentTracks[currentTracks.length - 1], musicList);
	return markIsTrigger(tracks);
}

function drawMusic(drawingAmount: number, priorTrack: Track | undefined, musicList: Music[]) {
	const totalWeight = getTotalWeight(musicList);
	const tracks: Track[] = [];

	for (let k = 0; k < drawingAmount; k++) {
		const randomWeight = Math.random() * totalWeight;

		let currentWeightSum = 0;
		let index = 0;
		while (currentWeightSum <= randomWeight) {
			currentWeightSum += musicList[index].weight;
			index++;
		}

		if (k === 0) {
			if (priorTrack == null) {
				tracks.push({
					url: musicList[index - 1].url,
					title: musicList[index - 1].title,
					artist: musicList[index - 1].artist,
					artwork: musicList[index - 1].artwork,
					id: musicList[index - 1].id,
					isPlayed: false,
					isTrigger: false,
				});
			}
			else {
				if (priorTrack.id !== musicList[index - 1].id) {
					tracks.push({
						url: musicList[index - 1].url,
						title: musicList[index - 1].title,
						artist: musicList[index - 1].artist,
						artwork: musicList[index - 1].artwork,
						id: musicList[index - 1].id,
						isPlayed: false,
						isTrigger: false,
					});
				}
				else {
					k--;
				}
			}
		}
		else {
			if (tracks[k - 1].id === musicList[index - 1].id) {
				k--;
			}
			else {
				tracks.push({
					url: musicList[index - 1].url,
					title: musicList[index - 1].title,
					artist: musicList[index - 1].artist,
					artwork: musicList[index - 1].artwork,
					id: musicList[index - 1].id,
					isPlayed: false,
					isTrigger: false,
				});
			}
		}
	}
	return tracks;
}

function getTotalWeight(musicList: Music[]) {
	let totalWeight = 0;

	for (const music of musicList) {
		totalWeight += music.weight;
	}
	return totalWeight;
}

function markIsTrigger(tracks: Track[]) {
	let count = 0;

	for (const track of tracks) {
		count++;

		if (count % (TRACK_LENGTH / 2) !== 0) {
			track.isTrigger = false;
		} else {
			track.isTrigger = true;
		}
	}
	return tracks;
}
