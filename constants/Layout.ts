import { Dimensions } from "react-native";

const { width, height } = Dimensions.get('screen');


export default {
	ratio: (height / width) * 8.31754,
	width: width / 21.66666,
	height: height / 46.88888,

	marginHorizontal: width * 0.05,
	listHeightWithoutScale: width * 0.149,
	marginBetweenAlbumartAndText: width * 0.029,
	bottomBarHeight: width * 0.149 * 1.2,
}