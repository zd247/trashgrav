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
	TextInput,
	YellowBox,
	Alert,
} from 'react-native'

import { connect } from 'react-redux'
import _ from 'lodash'

import colors from '../../assets/colors'
import Feather from 'react-native-vector-icons/Feather'
import * as ImageHelpers from '../../helpers/imageHelpers'
import { snapshotToArray } from '../../helpers/firebaseHelpers'
import * as firebase from 'firebase/app'
import 'firebase/storage'

class AdminItemScreen extends React.Component {
	constructor() {
		super()
		this.state = {
			image: '',
			price: '',
			name: '',
			description: '',
			isLoading: false,
		}

		YellowBox.ignoreWarnings(['source.uri should not'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('source.uri should not') <= -1) {
				_console.warn(message)
			}
		}
	}

	componentDidMount = () => {
		this.setState({ image: this.props.route.params.item.image })
		this.setState({ price: this.props.route.params.item.price })
		this.setState({ name: this.props.route.params.item.key })
		this.setState({ description: this.props.route.params.item.description })
		this.props.toggleIsLoadingItems(false)
	}

	componentWillUnmount = () => {
		console.log('[AdminItemScreen] component unmounted')
	}

	uploadImage = async image => {
		this.props.toggleIsLoadingItems(true)
		const ref = firebase
			.storage()
			.ref('Item Pictures')
			.child(this.props.route.params.item.key)

		try {
			//converting to blob
			const blob = await ImageHelpers.prepareBlob(image.uri)
			const snapshot = await ref.put(blob)

			let downloadUrl = await ref.getDownloadURL()

			blob.close()

			this.props.toggleIsLoadingItems(false)

			return downloadUrl
		} catch (error) {
			console.log(error)
		}
	}

	openImageLibrary = async () => {
		this.props.toggleIsLoadingItems(true)
		const result = await ImageHelpers.openImageLibrary()

		if (result) {
			const downloadUrl = await this.uploadImage(result)
			this.setState({ image: downloadUrl })
			this.props.toggleIsLoadingItems(false)
		}
	}

	openCamera = async () => {
		this.props.toggleIsLoadingItems(true)
		const result = await ImageHelpers.openCamera()

		if (result) {
			const downloadUrl = await this.uploadImage(result)
			this.setState({ image: downloadUrl })
			this.props.toggleIsLoadingItems(false)
		}
	}

	changePicture() {
		Alert.alert(
			'Loading image',
			'Choose an existing option... ',
			[
				{
					text: 'No',
					style: 'cancel',
				},
				{
					text: 'Photos',
					onPress: () => {
						this.openImageLibrary()
					},
				},
				{
					text: 'Camera',
					onPress: () => {
						this.openCamera()
					},
				},
			],
			{ cancelable: false }
		)
	}

	storeItemData = (image, category, price, description) => {
		firebase
			.database()
			.ref('Items/')
			.child(category)
			.set({
				description,
				category,
				price,
				image,
			})
			.then(response => {
				this.props.navigation.replace('AdminHomeScreen')
				this.setState({isLoading: false})
			})
	}

	navigateBackToHomeScreen = () => {
		const price = this.state.price
		const category = this.state.name.toLowerCase()
		const description = this.state.description
		const image = this.state.image

		if (!isNaN(price) && category.length >= 2) {
			if (
				image !== this.props.route.params.item.image ||
				category !== this.props.route.params.item.key ||
				price !== this.props.route.params.item.price ||
				description !== this.props.route.params.item.description
			) {
				Alert.alert(
					'Saving',
					'Do you wish to save your recent changes ? ',
					[
						{
							text: 'No',
							style: 'cancel',
							onPress: () => {
								this.props.navigation.replace('AdminHomeScreen')
							},
						},
						{
							text: 'Yes',
							onPress: () => {
								this.setState({isLoading: true})
								this.storeItemData(image, category, price, description)
							},
						},
					],
					{ cancelable: false }
				)
			} else {
				this.props.navigation.replace('AdminHomeScreen')
			}
		} else {
			alert(
				'Unable to navigate back, please fill in necessary fields before continue'
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={{ flex: 1 }}>
					<ScrollView style={{ flex: 1 }}>
						<SafeAreaView />
						<ImageBackground
							source={require('../../assets/admin_header_detail_bg.png')}
							style={{ flex: 1, alignItems: 'center' }}
							resizeMode={'stretch'}>
							<TouchableOpacity
								onPress={() => {
									this.navigateBackToHomeScreen()
								}}
								style={{
									alignSelf: 'flex-start',
									marginTop: 15,
									marginStart: 20,
								}}>
								<Feather name='arrow-left' color='white' size={35} />
							</TouchableOpacity>
							<View style={styles.image_container}>
								<TouchableOpacity
									disabled={false}
									style={{ flex: 1 }}
									onPress={() => this.changePicture()}>
									{this.props.recycleItemList.isLoading && (
										<View
											style={{
												...StyleSheet.absoluteFill,
												alignItems: 'center',
												justifyContent: 'center',
												zIndex: 1000,
												elevation: 1000,
											}}>
											<ActivityIndicator
												size='large'
												color={colors.logoColor}
											/>
										</View>
									)}
									<Image
										source={{ uri: this.state.image }}
										style={styles.image}
									/>
								</TouchableOpacity>
							</View>
						</ImageBackground>
						<ScrollView style={styles.footer}>
							<View style={{ flexDirection: 'row' }}>
								<Text
									style={[{ marginTop: 20, marginRight: 8 }, styles.textPrice]}>
									$
								</Text>
								<TextInput
									style={[{ marginTop: 25 }, styles.textPrice]}
									placeholder='Price...'
									keyboardType='decimal-pad'
									maxLength={6}
									value={this.state.price}
									onChangeText={price => {
										this.setState({ price: price })
									}}
								/>
							</View>

							<TextInput
								numberOfLines={1}
								style={styles.textName}
								autoCapitalize='characters'
								placeholder='Name...'
								autoCorrect={false}
								value={this.state.name.toUpperCase()}
								onChangeText={name => {
									this.setState({ name: name })
								}}
							/>
							<TextInput
								style={styles.textDetail}
								placeholder='Enter the recycle item details here...'
								autoCapitalize='sentences'
								value={this.state.description}
								multiline={true}
								onChangeText={text => {
									this.setState({ description: text })
								}}
							/>
						</ScrollView>
						<SafeAreaView />
					</ScrollView>
				</View>
			</View>
		)
	}
}

const mapStateToProps = state => {
	return {
		recycleItemList: state.recycleItemList,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		loadRecycleItem: recycleItemList =>
			dispatch({
				type: 'LOAD_RECYCLE_ITEMS_FROM_SERVER',
				payload: recycleItemList,
			}),
		toggleIsLoadingItems: bool =>
			dispatch({ type: 'TOGGLE_IS_LOADING_ITEMS', payload: bool }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminItemScreen)

const height = Dimensions.get('screen').height
const height_image = height * 0.5 * 0.5

const styles = StyleSheet.create({
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
		borderColor: 'grey',
		borderRadius: 30,
	},
	textPrice: {
		color: 'green',
		fontWeight: 'bold',
		fontSize: 30,
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
