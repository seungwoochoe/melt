import TrackPlayer, { Event, State } from 'react-native-track-player';
import Player from './Player';

let wasPausedByDuck = false;

module.exports = async function setup() {
	TrackPlayer.addEventListener(Event.RemotePause, () => {
		Player.pause();
	});

	TrackPlayer.addEventListener(Event.RemotePlay, () => {
		Player.play();
	});

	TrackPlayer.addEventListener(Event.RemoteNext, () => {
		Player.skipToNext();
	});

	TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
		const currentPosition = await TrackPlayer.getPosition();
		Player.skipToPrevious(currentPosition);
	});

	TrackPlayer.addEventListener(Event.RemoteSeek, e => {
		Player.seekTo(e.position);
	});

	TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
		if (e.permanent === true) {
			TrackPlayer.stop();
		} else {
			if (e.paused === true) {
				const playerState = await TrackPlayer.getState();
				wasPausedByDuck = playerState !== State.Paused;
				Player.pause();
			} else {
				if (wasPausedByDuck === true) {
					Player.play();
					wasPausedByDuck = false;
				}
			}
		}
	});
};
