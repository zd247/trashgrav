import React, { Component } from 'react'
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	ImageBackground,
	Image,
	Keyboard,
	ScrollView,
	Dimensions,
	ActivityIndicator,
} from 'react-native'

import CustomActionButton from '../components/CustomTempButton'

import colors from '../assets/colors'
import { normalize } from '../helpers/fontHelper'

import { Ionicons } from '@expo/vector-icons'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { connectActionSheet } from '@expo/react-native-action-sheet'

import { NavigationContainer } from '@react-navigation/native'
import {
	createDrawerNavigator,
	DrawerContentScrollView,
	DrawerItemList,
	DrawerItem,
} from '@react-navigation/drawer'

import * as ImageHelpers from '../helpers/imageHelpers'
import * as firebase from 'firebase/app'
import 'firebase/storage'

class UserProfileScreen extends Component {
	constructor() {
		super()
		this.state = {
			firstName: '',
			lastName: '',
			email: '',
			phoneNumber: '',
			image: '',
			uid: '',
			currentUser: {},
		}
	}

	componentDidMount = async () => {
		this.setState({
			currentUser: this.props.recycleItemList.user,
			firstName: this.props.recycleItemList.user.first_name,
			lastName: this.props.recycleItemList.user.last_name,
			email: this.props.recycleItemList.user.email,
			image: this.props.recycleItemList.user.image,
			uid: this.props.recycleItemList.user.uid,
		})
		this.props.toggleIsLoadingItems(false)
	}

	componentWillUnmount() {
		console.log('[UserProfileScreen] component unmounted')
	}

	submit = async item => {
		const tempUser = [
			{
				first_name: this.state.firstName,
				last_name: this.state.lastName,
				email: this.state.email,
				image: this.props.recycleItemList.user.image,
				uid: this.state.uid,
			},
		]

		try {
			this.props.toggleIsLoadingItems(true)

			await firebase
				.database()
				.ref('Users')
				.child(this.props.currentUser.key)
				.update({
					email: this.state.email,
					first_name: this.state.firstName,
					last_name: this.state.lastName,
					image: this.state.image,
				})

			this.props.updateUser(tempUser[0])
			console.log(tempUser)
			alert('Your recently changes has been applied')
			this.props.toggleIsLoadingItems(false)
		} catch (error) {
			console.log(error)
			this.props.props.toggleIsLoadingItems(false)
		}
	}

	uploadImage = async image => {
		const ref = firebase
			.storage()
			.ref('Profile Pictures/' + this.props.currentUser.key)

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
		const result = await ImageHelpers.openImageLibrary()

		if (result) {
			this.props.toggleIsLoadingItems(true)
			const downloadUrl = await this.uploadImage(result)

			const tempUser = [
				{
					first_name: this.state.firstName,
					last_name: this.state.lastName,
					email: this.state.email,
					image: downloadUrl,
					uid: this.state.uid,
				},
			]

			this.props.updateUser(tempUser[0])
			this.setState({ image: downloadUrl })

			this.props.toggleIsLoadingItems(false)
		}
	}

	openCamera = async () => {
		const result = await ImageHelpers.openCamera()

		if (result) {
			this.props.toggleIsLoadingItems(true)
			const downloadUrl = await this.uploadImage(result)

			const tempUser = [
				{
					first_name: this.state.firstName,
					last_name: this.state.lastName,
					email: this.state.email,
					image: downloadUrl,
					uid: this.state.uid,
				},
			]

			this.props.updateUser(tempUser[0])
			this.setState({ image: downloadUrl })

			this.props.toggleIsLoadingItems(false)
		}
	}

	changePicture() {
		const options = ['Select from Photos', 'Camera', 'Cancel']
		const cancelButtonIndex = 2

		this.props.showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				// Do something here depending on the button index selected
				if (buttonIndex == 0) {
					this.openImageLibrary()
				} else if (buttonIndex == 1) {
					this.openCamera()
				}
			}
		)
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={{ flex: 1 }}>
					<ScrollView style={{ flex: 1 }}>
						<SafeAreaView />

						<View
							style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<ImageBackground
								source={require('../assets/header.png')}
								style={styles.imageBackground}
								resizeMode='stretch'>
								<TouchableOpacity
									onPress={() => this.props.navigation.openDrawer()}>
									<Ionicons
										name='ios-menu'
										size={normalize(30)}
										color='white'
									/>
								</TouchableOpacity>
								<Text style={styles.headerTitle}>PROFILE</Text>
							</ImageBackground>
							<TouchableOpacity
								style={{ alignSelf: 'center', marginEnd: normalize(20) }}
								onPress={this.submit}>
								<Text style={{ fontSize: normalize(22), color: 'green' }}>
									Apply
								</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.imageContainer}>
							{this.props.recycleItemList.isLoading && (
								<View
									style={{
										...StyleSheet.absoluteFill,
										alignItems: 'center',
										justifyContent: 'center',
										zIndex: 1000,
										elevation: 1000,
									}}>
									<ActivityIndicator size='large' color={colors.logoColor} />
								</View>
							)}
							<TouchableOpacity
								disabled={false}
								style={{ flex: 1 }}
								onPress={() => this.changePicture()}>
								{this.props.recycleItemList.user.image ? (
									<Image
										source={{ uri: this.props.recycleItemList.user.image }}
										style={styles.image}
										// indicator={ProgressPie}
										indicatorProps={{
											size: 40,
											borderWidth: 0,
											color: colors.logoColor,
											unfilledColor: 'rgba(200,200,200,0.2)',
										}}
										imageStyle={{ borderRadius: 35 }}
									/>
								) : (
									<Image
										source={require('../assets/icon.png')}
										style={styles.image}
									/>
								)}
							</TouchableOpacity>
						</View>
						<View style={{ flex: 1 }}>
							<View style={styles.textInputContainer}>
								<View
									style={{ flex: 1, flexDirection: 'row', paddingBottom: 20 }}>
									<TextInput
										style={styles.textInput}
										placeholder='First name...'
										onBlur={Keyboard.dismiss}
										value={this.state.firstName}
										onChangeText={text => this.setState({ firstName: text })}
										ref={component => {
											this.textInputRef = component
										}}
									/>
									<TextInput
										style={[styles.textInput, { alignSelf: 'center' }]}
										placeholder='Last name...'
										onBlur={Keyboard.dismiss}
										value={this.state.lastName}
										onChangeText={text => this.setState({ lastName: text })}
										ref={component => {
											this.textInputRef = component
										}}
									/>
								</View>
								<View style={{ flex: 1, paddingBottom: 20 }}>
									<TextInput
										style={[styles.textInput, { alignSelf: 'center' }]}
										placeholder='Email...'
										value={this.state.email}
										onBlur={Keyboard.dismiss}
										onChangeText={text => this.setState({ email: text })}
										ref={component => {
											this.textInputRef = component
										}}
									/>
								</View>
							</View>
						</View>

						<SafeAreaView />
					</ScrollView>
				</View>
			</View>
		)
	}
}

const screenWidth = Dimensions.get('screen').width
const height = Dimensions.get('screen').height
const height_image = height * 0.5 * 0.5

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	imageBackground: {
		width: screenWidth * 0.45,
		height: normalize(43),
		justifyContent: 'space-evenly',
		alignItems: 'center',
		flexDirection: 'row',
	},
	headerTitle: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: normalize(17),
	},

	textInputContainer: {
		flex: 1,
		margin: normalize(20),
	},
	textInput: {
		flex: 1,
		backgroundColor: 'transparent',
		borderColor: 'black',
		width: '100%',
		borderWidth: 3,
		fontSize: normalize(18),
		fontWeight: '200',
		color: 'black',
		padding: normalize(10),
		marginHorizontal: normalize(10),
	},
	imageContainer: {
		width: height_image,
		height: height_image,
		alignSelf: 'center',
		marginVertical: normalize(40),
	},
	image: {
		width: '100%',
		height: '100%',
		borderWidth: 5,
		borderColor: 'grey',
		borderRadius: 30,
	},
})

const mapStateToProps = state => {
	return {
		recycleItemList: state.recycleItemList,
		currentUser: state.auth.currentUser,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		updateUser: user =>
			dispatch({
				type: 'UPDATE_USER_INFORMATION',
				payload: user,
			}),
		updateImage: image =>
			dispatch({ type: 'UPDATE_USER_IMAGE', payload: image }),
		toggleIsLoadingItems: bool =>
			dispatch({ type: 'TOGGLE_IS_LOADING_ITEMS', payload: bool }),
	}
}

const wrapper = compose(
	connect(mapStateToProps, mapDispatchToProps),
	connectActionSheet
)

export default wrapper(UserProfileScreen)
