import { Dimensions } from "react-native"

const { width, height } = Dimensions.get('screen');


export default {
	ratio: (height / width) * 8.31754,
	width: width / 21.66666,
	height: height / 46.88888,
}