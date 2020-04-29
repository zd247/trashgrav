import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	Dimensions,
	TouchableOpacity,
} from 'react-native'
import Carousel, { ParallaxImage } from 'react-native-snap-carousel'
import Feather from 'react-native-vector-icons/Feather'

import colors from '../../assets/colors'
import * as Animatable from 'react-native-animatable'
import CustomActionButton from '../../components/CustomTempButton'
import InputField from '../../components/InputField'
import PwdField from '../../components/PwdField'

import { connect } from 'react-redux'

import * as firebase from 'firebase/app'
import 'firebase/auth'

const screenWidth = Dimensions.get('screen').width

const AdminLoginScreen = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [checkEmailInputText, setCheckEmailInputText] = useState(false)
	const [entries, setEntries] = useState([
		{
			thumbnail: '',
		},
		{
			thumbnail: '',
		},
	])

	const handleEmailTextInputChange = text => {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (re.test(text.toLowerCase())) {
			setCheckEmailInputText(true)
			setEmail(text)
		} else {
			setCheckEmailInputText(false)
			setEmail('')
		}
	}

	const handlePasswordInputChange = text => {
		setPassword(text)
	}

	const onContinue = async () => {
		if (checkEmailInputText && password.length >= 6) {
			try {
				const response = await firebase
					.auth()
					.signInWithEmailAndPassword(email, password)
				if (response) {
					console.log(response.user)
					props.changeAdminMode
					console.log(props.currentUser.isAdmin)
					console.log('admin logged in !')
					const userID = response.user.uid
					console.log(userID)

					// this.props.signIn(response.user)
					props.navigation.navigate('AdminHomeScreen')
				}
			} catch (e) {
				console.log(e)
				alert(e)
			}
		}
	}

	const _renderItem = ({ item, index }, parallaxProps) => {
		return (
			<View style={styles.item}>
				<ParallaxImage
					containerStyle={styles.imageContainer}
					style={styles.image}
					parallaxFactor={0.4}
					{...parallaxProps}
				/>
				{index === 0 ? (
					<View style={styles.absolute}>
						<View style={styles.box}>
							<InputField
								title='Email'
								fontAwesomeIcon='envelope'
								color={'#009bd1'}
								placeHolder='Ex: admin@trash.grav'
								autoCapitalize='none'
								keyboardType='email-address'
								onInputChange={handleEmailTextInputChange}>
								{checkEmailInputText ? (
									<Animatable.View animation='bounceIn'>
										<Feather name='check-circle' color='green' size={20} />
									</Animatable.View>
								) : null}
							</InputField>

							<PwdField
								color={'#009bd1'}
								value={password}
								onInputChange={handlePasswordInputChange}
							/>

							<TouchableOpacity
								style={{ alignItems: 'flex-end' }}
								onPress={onContinue}>
								<View style={styles.button}>
									<Feather name='arrow-right' color='white' size={25} />
								</View>
							</TouchableOpacity>
						</View>
					</View>
				) : (
					<View style={styles.absolute}>
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								paddingHorizontal: 40,
							}}>
							<Text style={{ fontSize: 20, color: '#009bd1' }}>
								Want to be one of us? Call 180042069
							</Text>
						</View>
					</View>
				)}
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<SafeAreaView />
			<View style={{ flex: 1 }}>
				<ScrollView style={{ flex: 1 }}>
					{/* -------header------- */}
					<Animatable.View style={styles.header} animation='fadeInUpBig'>
						<Text style={styles.textHeader}>Start managing !</Text>
					</Animatable.View>
					<View style={styles.footer}>
						<Carousel
							sliderWidth={screenWidth}
							sliderHeight={screenWidth}
							itemWidth={screenWidth - 60}
							data={entries}
							renderItem={_renderItem}
							hasParallaxImages={true}
						/>
					</View>
				</ScrollView>
			</View>
			<SafeAreaView />
		</View>
	)
}

const mapStateToProps = state => {
	return {
		recycleItemList: state.recycleItemList,
		currentUser: state.auth.currentUser,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		signIn: user => dispatch({ type: 'LOAD_USER_FROM_SERVER', payload: user }),
		signOut: () => dispatch({ type: 'SIGN_OUT' }),
		changeAdminMode: () => dispatch({ type: 'CHANGE_TO_ADMIN_MODE' }),
		changeBackFromAdminMode: () =>
			dispatch({ type: 'CHANGE_BACK_FROM_ADMIN_MODE' }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLoginScreen)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bgAdminLogin,
		paddingTop: Platform.OS == 'android' ? 50 : 0,
	},
	header: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingHorizontal: 30,
		paddingVertical: 50,
	},
	footer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textHeader: {
		color: 'white',
		fontSize: 30,
		fontWeight: 'bold',
	},
	item: {
		width: screenWidth - 60,
		height: screenWidth - 60,
	},
	imageContainer: {
		flex: 1,
		marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
		backgroundColor: 'white',
		borderRadius: 8,
	},
	image: {
		...StyleSheet.absoluteFillObject,
		resizeMode: 'cover',
	},
	absolute: {
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	box: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: 18,
	},
	button: {
		width: 100,
		backgroundColor: '#4399AD',
		marginTop: 15,
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 10,
	},
})
