import React, { Component, useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	StatusBar,
	SafeAreaView,
	YellowBox,
	ImageBackground,
	Modal,
	Dimensions,
	TouchableOpacity,
} from 'react-native'

import Ionicons from 'react-native-vector-icons/Ionicons'
import Feather from 'react-native-vector-icons/Feather'
import * as Animatable from 'react-native-animatable'
import { normalize } from '../helpers/fontHelper'

import colors from '../assets/colors'
import strings from '../assets/strings'

import _ from 'lodash'
import { connect } from 'react-redux'
import ErrorBoundary from '../components/ErrorBoundary'
import CustomActionButton from '../components/CustomTempButton'
import PopUpPolicy from '../components/PopUpPolicy'
import InputField from '../components/InputField'
import PwdField from '../components/PwdField'
import { userCache } from '../helpers/cacheHelper'

import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const Policy = () => {
	const [showTermsPolicy, setShowTermPolicy] = useState(false)
	const [showCookiePolicy, setShowCookiePolicy] = useState(false)

	const openTermPolicy = () => {
		setShowTermPolicy(true)
	}

	const openCookiePolicy = () => {
		setShowCookiePolicy(true)
	}

	const cancelTermsPolicy = () => {
		setShowTermPolicy(false)
	}

	const cancelCookiePolicy = () => {
		setShowCookiePolicy(false)
	}

	return (
		<View style={{ flex: 1, justifyContent: 'flex-end' }}>
			<View
				style={{
					alignSelf: 'center',
					marginTop: normalize(30),
					marginHorizontal: normalize(10),
				}}>
				<Text>
					By using our application, you agree to our
					<Text> </Text>
					<Text style={{ color: colors.textLinkStd }} onPress={openTermPolicy}>
						Terms, Data policy
					</Text>
					<Text> </Text>
					and
					<Text> </Text>
					<Text
						style={{ color: colors.textLinkStd }}
						onPress={openCookiePolicy}>
						Cookie Policy
					</Text>
					. You may receive SMS notifications from and can opt out at any time
				</Text>
			</View>
			{/* terms and policy modal pop up */}
			<PopUpPolicy visible={showTermsPolicy} onClosePolicy={cancelTermsPolicy}>
				<Text>{strings.termsPolicy}</Text>
			</PopUpPolicy>

			{/* cookie policy pop up  */}
			<PopUpPolicy
				visible={showCookiePolicy}
				onClosePolicy={cancelCookiePolicy}>
				<Text>{strings.cookiePolicy}</Text>
			</PopUpPolicy>
		</View>
	)
}

class LoginScreen extends Component {
	constructor() {
		super()
		this.state = {
			checkTextInputChange: false,
			isLoading: false,
			phoneNumber: '',
			rspwdPhoneNumber: '',
			password: '',
			resetPassword: false,
			rspwdNewPassword: '',
			rspwdConfirmPassword: '',
			checkRspwdTextInputChange: false,
		}
		YellowBox.ignoreWarnings(['Setting a timer'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('Setting a timer') <= -1) {
				_console.warn(message)
			}
		}
	}

	componentWillUnmount = () => {
		console.log('[LoginScreen] component umounted')
		firebase.database().ref('Users').off()
	}

	textInputChange = text => {
		const phoneNoWithoutSigns = /^\d{10}$/
		const phoneNoWithSigns = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
		if (text.length >= 9) {
			if (text.match(phoneNoWithoutSigns) || text.match(phoneNoWithSigns)) {
				this.setState({ checkTextInputChange: true })
				this.setState({ phoneNumber: text })
			}
		} else {
			this.setState({ checkTextInputChange: false })
			this.setState({ phoneNumber: '' })
		}
	}

	rspwdTextInputChange = text => {
		const phoneNoWithoutSigns = /^\d{10}$/
		const phoneNoWithSigns = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
		if (text.length >= 9) {
			if (text.match(phoneNoWithoutSigns) || text.match(phoneNoWithSigns)) {
				this.setState({ checkRspwdTextInputChange: true })
				this.setState({ rspwdPhoneNumber: text })
			}
		} else {
			this.setState({ checkRspwdTextInputChange: false })
			this.setState({ rspwdPhoneNumber: '' })
		}
	}

	passwordInputChange = text => {
		this.setState({ password: text })
	}

	onResetPassword = async () => {
		this.setState({ isLoading: true })
		if (this.state.checkRspwdTextInputChange) {
			let phone = this.state.rspwdPhoneNumber.replace(/\D/g, '')
			phone = phone.replace(phone[0], '+84')
			firebase
				.database()
				.ref('Users')
				.orderByChild('phone')
				.equalTo(phone)
				.once('value', snapshot => {
					if (snapshot.exists()) {
						snapshot.forEach(data => {
							if (
								this.state.rspwdNewPassword ===
									this.state.rspwdConfirmPassword &&
								this.state.rspwdNewPassword.length >= 6
							) {
								firebase
									.database()
									.ref('Users')
									.child(data.key)
									.child('password')
									.set(this.state.rspwdNewPassword)
									.then(res => {
										alert('Your password has been reset')
										this.setState({ resetPassword: false })
										this.setState({ isLoading: false })
									})
							} else {
								alert(
									'Please make sure both the password fields are entered correctly'
								)
								this.setState({ rspwdNewPassword: '' })
								this.setState({ rspwdConfirmPassword: '' })
								this.setState({ isLoading: false })
							}
						})
					} else {
						alert('Phone number is invalid, please re-enter')
						this.setState({ password: '' })
						this.setState({ isLoading: false })
					}
				})
		} else {
			alert('Invalid phone number format entered')
			this.setState({ isLoading: false })
		}
	}

	onContinue = async () => {
		this.setState({ isLoading: true })
		if (this.state.checkTextInputChange && this.state.password.length >= 6) {
			let phone = this.state.phoneNumber.replace(/\D/g, '')
			phone = phone.replace(phone[0], '+84')
			this.setState({ phoneNumber: phone })

			//verify user info
			firebase
				.database()
				.ref('Users')
				.orderByChild('phone')
				.equalTo(phone)
				.once('value', snapshot => {
					if (snapshot.exists()) {
						snapshot.forEach(data => {
							if (data.child('password').val() === this.state.password) {
								this.signingIn(data)
								this.setState({ isLoading: false })
							} else {
								alert('Password is invalid, please re-enter')
								this.setState({ password: '' })
								this.setState({ isLoading: false })
							}
						})
					} else {
						alert('Phone number is invalid, please re-enter')
						this.setState({ password: '' })
						this.setState({ isLoading: false })
					}
				})
		} else {
			alert('Invalid phone number or password format entered')
			this.setState({ isLoading: false })
		}
	}

	signingIn = async (data) => {
		await userCache.set('data', data)
		const value = userCache.get('data')
		this.props.signIn(value)
	}

	render() {
		return (
			<ErrorBoundary>
				<View style={{ flex: 1, backgroundColor: 'white' }}>
					<SafeAreaView />
					<StatusBar barStyle='light-content' />
					{/* ----------[loading indicator]----------*/}
					{this.state.isLoading ? (
						<View
							style={[
								StyleSheet.absoluteFill,
								{
									alignItems: 'center',
									justifyContent: 'center',
									zIndex: 1000,
									elevation: 1000,
								},
							]}>
							<ActivityIndicator size='large' color={colors.logoColor} />
						</View>
					) : null}

					{/* ----------[[screen]---------- */}
					<View style={{ flex: 1 }}>
						<ScrollView style={{ flex: 1 }}>
							<View style={styles.container}>
								{/* -------header------- */}
								<Animatable.View style={styles.header} animation='fadeInUpBig'>
									<Text style={styles.textHeader}>Recycle with us!</Text>
								</Animatable.View>

								{/* -------footer------- */}
								<View style={styles.footer}>
									{/* inputs */}
									<InputField
										title='Phone number'
										fontAwesomeIcon='phone-square'
										color={colors.bgUserLogin}
										image={true}
										placeHolder='Ex: (012) 345-6789'
										autoCapitalize='none'
										keyboardType='phone-pad'
										onInputChange={this.textInputChange}>
										{this.state.checkTextInputChange ? (
											<Animatable.View animation='bounceIn'>
												<Feather name='check-circle' color='green' size={20} />
											</Animatable.View>
										) : null}
									</InputField>

									<PwdField
										color={colors.bgUserLogin}
										value={this.state.password}
										onInputChange={this.passwordInputChange}
									/>
									<TouchableOpacity
										onPress={() => this.setState({ resetPassword: true })}>
										<Text style={{ color: '#009bd1' }}>Forgot password ?</Text>
									</TouchableOpacity>

									{/* buttons */}
									<View style={{ flex: 1, marginTop: 30 }}>
										<CustomActionButton
											style={[
												styles.button,
												{ backgroundColor: colors.bgUserLogin },
											]}
											title='Login'
											onPress={this.onContinue}>
											<Text style={{ fontWeight: 'bold', color: 'white' }}>
												Continue
											</Text>
										</CustomActionButton>

										<CustomActionButton
											style={[
												styles.button,
												{ backgroundColor: 'transparent' },
											]}
											title='Register'
											onPress={() =>
												this.props.navigation.navigate('SignUpScreen')
											}>
											<Text
												style={{
													fontWeight: 'bold',
													color: colors.bgUserLogin,
												}}>
												Register
											</Text>
										</CustomActionButton>
									</View>
									{/* end of buttons */}

									<Policy />

									{/* reset password modals*/}
									<Modal
										animationType='fade'
										transparent={true}
										visible={this.state.resetPassword}>
										<View style={{ flex: 1 }}>
											<ScrollView style={{ flex: 1 }}>
												<View style={styles.modalContainer}>
													<ImageBackground
														source={require('../assets/header_detail.png')}
														style={{ flex: 1, alignItems: 'center' }}
														resizeMode={'stretch'}>
														<TouchableOpacity
															onPress={() => {
																this.setState({ resetPassword: false })
															}}
															style={{
																alignSelf: 'flex-start',
																marginTop: normalize(10),
																marginStart: normalize(15),
															}}>
															<Ionicons
																name='ios-close'
																color='white'
																size={normalize(40)}
															/>
														</TouchableOpacity>
														<View style={styles.image_container}>
															<Text
																style={{
																	fontSize: normalize(35),
																	color: 'white',
																}}>
																Reset Password
															</Text>
														</View>
													</ImageBackground>
													<View style={{ padding: normalize(15) }}>
														<InputField
															title='Phone number'
															fontAwesomeIcon='phone-square'
															color={colors.bgUserLogin}
															image={true}
															placeHolder='Ex: (012) 345-6789'
															autoCapitalize='none'
															keyboardType='phone-pad'
															onInputChange={this.rspwdTextInputChange}>
															{this.state.checkRspwdTextInputChange ? (
																<Animatable.View animation='bounceIn'>
																	<Feather
																		name='check-circle'
																		color='green'
																		size={normalize(20)}
																	/>
																</Animatable.View>
															) : null}
														</InputField>

														<PwdField
															title={'New password'}
															color={colors.bgUserLogin}
															value={this.state.rspwdNewPassword}
															onInputChange={text => {
																this.setState({ rspwdNewPassword: text })
															}}
														/>

														<PwdField
															title={'Confirm password'}
															color={colors.bgUserLogin}
															value={this.state.rspwdConfirmPassword}
															onInputChange={text => {
																this.setState({ rspwdConfirmPassword: text })
															}}
														/>
													</View>

													<TouchableOpacity
														onPress={() => {
															this.onResetPassword()
														}}
														style={{ alignItems: 'flex-end' }}>
														<View style={styles.modalButton}>
															<Feather
																name='arrow-right'
																color='white'
																size={normalize(25)}
															/>
														</View>
													</TouchableOpacity>
												</View>
											</ScrollView>
										</View>
									</Modal>
								</View>
							</View>
						</ScrollView>
					</View>
					<SafeAreaView />
				</View>
			</ErrorBoundary>
		)
	}
}

// redux

const mapStateToProps = state => {
	return {
		recycleItemList: state.recycleItemList,
		currentUser: state.auth.currentUser,
		//temp: state.recycleCart,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		signIn: user => dispatch({ type: 'SIGN_IN', payload: user }),
		signOut: () => dispatch({ type: 'SIGN_OUT' }),
	}
}

// navigation
export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)

const height = Dimensions.get('screen').height
const height_image = height * 0.5 * 0.5

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bgUserLogin,
	},
	header: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingHorizontal: normalize(20),
		paddingVertical: normalize(50),
	},
	footer: {
		flex: 1,
		backgroundColor: 'white',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: normalize(20),
		paddingVertical: normalize(30),
	},
	textHeader: {
		color: 'white',
		fontSize: normalize(30),
		fontWeight: 'bold',
	},
	button: {
		borderColor: colors.bgPrimary,
		borderWidth: 0.5,
		borderRadius: normalize(30),
		marginBottom: normalize(10),
		alignSelf: 'center',
		width: '80%',
		height: normalize(42),
	},
	modalContainer: {
		backgroundColor: '#f2f2f2',
		margin: normalize(20),
		marginTop: normalize(40),
		borderWidth: 2.5,
		flex: 1,
	},
	image_container: {
		width: height_image,
		height: height_image,
	},
	modalButton: {
		width: normalize(80),
		backgroundColor: colors.bgUserLogin,
		borderRadius: normalize(50),
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: normalize(8),
		margin: normalize(15),
	},
})
