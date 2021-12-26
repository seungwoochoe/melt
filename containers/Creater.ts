import { Music, Track, History } from '../types';

const TRACK_LENGTH = 20;
const SKIP_WEIGHT_MODIFIER = 0.85;


export function weightMusicList(musicList: Music[], historyList: History[]) {
	for (const history of historyList) {
		
	}
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
				tracks.push({ ...musicList[index - 1], isPlayed: false, isTrigger: false });
			} else {
				if (priorTrack.id !== musicList[index - 1].id) {
					tracks.push({ ...musicList[index - 1], isPlayed: false, isTrigger: false });
				} else {
					k--;
				}
			}
		} else {
			if (tracks[k - 1].id === musicList[index - 1].id) {
				k--;
			} else {
				tracks.push({ ...musicList[index - 1], isPlayed: false, isTrigger: false });
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
