import { Music, WeightedMusic, Track, History } from '../types';

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
export function complementTracks(currentTracks: Track[], weightedMusicList: WeightedMusic[]) {
	const tracksToBeAdded = drawMusic(TRACK_LENGTH - currentTracks.length, currentTracks[currentTracks.length - 1], weightedMusicList);
	const tracks = [...currentTracks, ...tracksToBeAdded];
	return markIsTrigger(tracks);
}

export function getMoreTracks(currentTracks: Track[], weightedMusicList: WeightedMusic[]) {
	if (weightedMusicList.length === 1) {
		return [{ ...weightedMusicList[0], isPlayed: false, isTrigger: true }];
	}

	const tracks = drawMusic(TRACK_LENGTH / 2, currentTracks[currentTracks.length - 1], weightedMusicList);
	return markIsTrigger(tracks);
}

function drawMusic(drawingAmount: number, priorTrack: Track | undefined, weightedMusicList: WeightedMusic[]) {
	const totalWeight = getTotalWeight(weightedMusicList);
	const tracks: Track[] = [];

	for (let k = 0; k < drawingAmount; k++) {
		const randomWeight = Math.random() * totalWeight;

		let currentWeightSum = 0;
		let index = 0;
		while (currentWeightSum <= randomWeight) {
			currentWeightSum += weightedMusicList[index].weight;
			index++;
		}

		if (k === 0) {
			if (priorTrack == null) {
				tracks.push({ ...weightedMusicList[index - 1], isPlayed: false, isTrigger: false });
			} else {
				if (priorTrack.title !== weightedMusicList[index - 1].title) {
					tracks.push({ ...weightedMusicList[index - 1], isPlayed: false, isTrigger: false });
				} else {
					k--;
				}
			}
		} else {
			if (tracks[k - 1].title === weightedMusicList[index - 1].title) {
				k--;
			} else {
				tracks.push({ ...weightedMusicList[index - 1], isPlayed: false, isTrigger: false });
			}
		}
	}
	return tracks;
}

function getTotalWeight(weightedMusicList: WeightedMusic[]) {
	let totalWeight = 0;

	for (const weightedMusic of weightedMusicList) {
		totalWeight += weightedMusic.weight;
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
