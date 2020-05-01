import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	Dimensions,
	Image,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

export default class AdminDetailScreen extends React.Component {
	constructor() {
		super()
	}

	

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				<ImageBackground
					source={require('../../assets/admin_header_detail_bg.png')}
					style={{ flex: 1, alignItems: 'center' }}
					resizeMode={'stretch'}>
					<View style={styles.image_container}>
						<Image
							source={{ uri: this.props.route.params.item.image }}
							style={styles.image}
						/>
					</View>
				</ImageBackground>
				<ScrollView style={styles.footer}>
					<Text style={styles.textPrice}>
						$ {this.props.route.params.item.price}
					</Text>
					<Text numberOfLines={2} style={styles.textName}>
						{this.props.route.params.item.key.toUpperCase()}
					</Text>
					<Text style={styles.textDetail}>
						{this.props.route.params.item.description}
					</Text>
				</ScrollView>
				<SafeAreaView />
			</View>
		)
	}
}

const height = Dimensions.get('screen').height
const height_image = height * 0.5 * 0.5

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	footer: {
		flex: 1,
		paddingHorizontal: 40,
	},
	image_container: {
		width: height_image,
		height: height_image,
		marginTop: height_image / 3,
	},
	image: {
		width: '100%',
		height: '100%',
		borderWidth: 5,
		borderColor: 'white',
		borderRadius: 30,
	},
	textPrice: {
		color: 'green',
		fontWeight: 'bold',
		fontSize: 30,
		marginTop: 20,
	},
	textName: {
		color: '#3e3c3e',
		fontWeight: 'bold',
		fontSize: 45,
		marginTop: 5,
	},
	textDetail: {
		color: 'gray',
		marginTop: 10,
		marginBottom: 20,
	},
})
