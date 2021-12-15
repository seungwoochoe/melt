import { Alert } from 'react-native';
import { Music, WeightedMusic, Track, History } from '../types';
import Player from './Player';

const TRACK_LENGTH = 20;

const SKIP_WEIGHT_MODIFIER = 0.85;
const BOOST_WEIGHT_MODIFIER = 0.2;


// function weightMusicList(musicList, userActionList) {
// 	const initializedMusicList = initializeWeights(musicList);
// 	return applyUserActionEffects(initializedMusicList, userActionList);
// }



// function applyUserActionEffects(initializedMusicList, userActionList) {
// 	userActionList.skip.forEach(element => {
// 		let targetMusic = initializedMusicList.find(music => music.title === element);

// 		if (targetMusic != null) {
// 			targetMusic.weight = targetMusic.weight * SKIP_WEIGHT_MODIFIER;
// 		}
// 	});

// 	userActionList.boost.forEach(element => {
// 		let targetMusic = initializedMusicList.find(music => music.title === element);

// 		if (targetMusic != null) {
// 			targetMusic.weight = targetMusic.weight + BOOST_WEIGHT_MODIFIER;
// 		}
// 	})

// 	return initializedMusicList;
// };

export function initializeWeights(musicList: Music[]) {
	const weightedMusicList: WeightedMusic[] = [];

	for (const music of musicList) {
		weightedMusicList.push({ ...music, weight: 1 });
	}
	return weightedMusicList;
};

// If there is no or only one music in storage, "createPlaylist" function should not be called.
export function complementTracks(currentTracks: Track[]) {
	const tracksToBeAdded = drawMusic(TRACK_LENGTH - currentTracks.length, currentTracks[currentTracks.length - 1]);
	const tracks = [...currentTracks, ...tracksToBeAdded];
	return markIsTrigger(tracks);
}

export function appendMoreTracks(currentTracks: Track[]) {
	if (Player.musicList.length === 1) {
		return [...currentTracks, {...Player.weightedMusicList[0], isPlayed: false, isTrigger: true}];
	}

	let tracksToBeAdded = drawMusic(TRACK_LENGTH / 2, currentTracks[currentTracks.length - 1]);
	tracksToBeAdded = markIsTrigger(tracksToBeAdded);
	return [...currentTracks, ...tracksToBeAdded];
}

function drawMusic(drawingAmount: number, priorTrack: Track | undefined) {
	const totalWeight = getTotalWeight();
	const tracks: Track[] = [];

	for (let k = 0; k < drawingAmount; k++) {
		const randomWeight = Math.random() * totalWeight;

		let currentWeightSum = 0;
		let index = 0;
		while (currentWeightSum <= randomWeight) {
			currentWeightSum += Player.weightedMusicList[index].weight;
			index++;
		}

		if (k === 0) {
			if (priorTrack == null) {
				tracks.push({ ...Player.weightedMusicList[index - 1], isPlayed: false, isTrigger: false });
			} else {
				if (priorTrack.title !== Player.weightedMusicList[index - 1].title) {
					tracks.push({ ...Player.weightedMusicList[index - 1], isPlayed: false, isTrigger: false });
				} else {
					k--;
				}
			}
		} else {
			if (tracks[k - 1].title === Player.weightedMusicList[index - 1].title) {
				k--;
			} else {
				tracks.push({ ...Player.weightedMusicList[index - 1], isPlayed: false, isTrigger: false });
			}
		}
	}
	return tracks;
}

function getTotalWeight() {
	let totalWeight = 0;

	for (const weightedMusic of Player.weightedMusicList) {
		totalWeight += weightedMusic.weight;
	}
	return totalWeight;
}

function markIsTrigger(tracks: Track[]) {
	let count = 0;

	for (const track of tracks) {
		count++;

		if (count % (TRACK_LENGTH / 2) === 0) {
			track.isTrigger = true;
		}
	}
	return tracks;
}
