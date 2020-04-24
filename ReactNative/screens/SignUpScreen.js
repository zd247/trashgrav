import React, { Component } from 'react'
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Platform,
	ActivityIndicator,
	ScrollView,
	StatusBar,
	Image,
	YellowBox,
} from 'react-native'

import {
	CodeField,
	Cursor,
	useBlurOnFulfill,
	useClearByFocusCell,
} from 'react-native-confirmation-code-field'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import * as Animatable from 'react-native-animatable'
import _ from 'lodash'

import colors from '../assets/colors'

import CodeInputLayout from '../components/CodeInputLayout'
import CustomActionButton from '../components/CustomTempButton'
import { connect } from 'react-redux'

import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

class SignUpScreen extends Component {
	constructor() {
		super()
		this.state = {
			firstName: '',
			lastName: '',
			phoneNumber: '',
			isLoading: false,
			checkPhoneInputChange: false,
			checkFNameInputChange: false,
			checkLNameInputChange: false,
			confirm: null,
		}

		// to ignore the firebase message
		YellowBox.ignoreWarnings(['Setting a timer'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('Setting a timer') <= -1) {
				_console.warn(message)
			}
		}
	}

	phoneTextInputChange = text => {
		const phoneNoWithoutSigns = /^\d{10}$/
		const phoneNoWithSigns = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
		if (text.length >= 9) {
			if (text.match(phoneNoWithoutSigns) || text.match(phoneNoWithSigns)) {
				this.setState({ checkPhoneInputChange: true })
				this.setState({ phoneNumber: text })
			}
		} else {
			this.setState({ checkPhoneInputChange: false })
			this.setState({ phoneNumber: '' })
		}
	}

	FNameTextInputChange = value => {
		if (value.length >= 1) {
			this.setState({ checkFNameInputChange: true })
		} else {
			this.setState({ checkFNameInputChange: false })
		}
	}

	LNameTextInputChange = value => {
		if (value.length >= 1) {
			this.setState({ checkLNameInputChange: true })
		} else {
			this.setState({ checkLNameInputChange: false })
		}
	}

	onContinue = () => {
		if (
			this.state.checkPhoneInputChange &&
			this.state.checkFNameInputChange &&
			this.state.checkLNameInputChange
		) {
			// this.setState({ isLoading: true })
			let phone = this.state.phoneNumber.replace(/\D/g, '')
			phone = phone.replace(phone[0], '+84')

			// check the database if the phone number exists
			firebase
				.database()
				.ref('Users')
				.orderByChild('phone')
				.equalTo(phone)
				.on('value', snapshot => {
					if (snapshot.exists()) {
						alert(
							'Phone number has already existed' +
								'please re-enter a new phone number'
						)
					} else {
						this.confirmPhoneNumber(phone)
					}
				})
		} else {
			Alert('Please fill in the required fields')
		}
	}

	confirmPhoneNumber = phone => {
		firebase
			.auth()
			.signInWithPhoneNumber(phone, true)
			.then(confirmation => {
				this.setState({ confirm: confirmation })
				this.setState({ phoneNumber: phone })
			})
			.catch(error => {
				alert(error.message)
				console.log(error)
			})
	}

	confirmVerificationCode = async code => {
		try {
			const response = await this.state.confirm.confirm(code)
			if (response) {
				const user = await firebase
					.database()
					.ref('Users')
					.child(response.user.uid)
					.set({
						phone: this.state.phoneNumber,
						uid: response.user.uid,
						first_name: this.state.firstName,
						last_name: this.state.lastName,
					})
				if (user) {
					// store in the redux
					console.log('stored')
				}
			}
		} catch (error) {
			Alert('Invalid code')
		}
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<StatusBar barStyle='light-content' />
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
								<Text style={styles.textHeader}>Join our community</Text>
							</Animatable.View>

							{/* -------footer------- */}
							<View style={styles.footer}>
								{this.state.confirm ? (
									<CodeInputLayout onInput={this.confirmVerificationCode} />
								) : (
									<View>
										<Text style={styles.textFooter}>Phone number</Text>
										<View style={styles.action}>
											<FontAwesome
												name='phone-square'
												color={colors.bgUserLogin}
												size={20}
											/>
											<Image
												style={{ marginStart: 5 }}
												source={require('../assets/vn_flag.png')}
											/>
											<TextInput
												placeholder='Ex: (012) 345-6789'
												style={styles.textInput}
												blurOnSubmit
												autoCapitalize='none'
												autoCorrect={false}
												keyboardType='phone-pad'
												maxLength={13}
												onChangeText={text => this.phoneTextInputChange(text)}
											/>
											{this.state.checkPhoneInputChange ? (
												<Animatable.View animation='bounceIn'>
													<Feather
														name='check-circle'
														color='green'
														size={20}
													/>
												</Animatable.View>
											) : null}
										</View>
										<Text style={styles.textFooter}>First name</Text>
										<View style={styles.action}>
											<FontAwesome
												name='address-card'
												color={colors.bgUserLogin}
												size={20}
											/>
											<TextInput
												placeholder='Ex: Marcus'
												style={styles.textInput}
												blurOnSubmit
												autoCapitalize='sentences'
												autoCorrect={false}
												keyboardType='default'
												maxLength={15}
												onChangeText={text => this.FNameTextInputChange(text)}
											/>
											{this.state.checkFNameInputChange ? (
												<Animatable.View animation='bounceIn'>
													<Feather
														name='check-circle'
														color='green'
														size={20}
													/>
												</Animatable.View>
											) : null}
										</View>

										<Text style={styles.textFooter}>Last name</Text>
										<View style={styles.action}>
											<FontAwesome
												name='address-card'
												color={colors.bgUserLogin}
												size={20}
											/>
											<TextInput
												placeholder='Ex: Aurelius'
												style={styles.textInput}
												blurOnSubmit
												autoCapitalize='sentences'
												autoCorrect={false}
												keyboardType='default'
												maxLength={13}
												onChangeText={text => this.LNameTextInputChange(text)}
											/>
											{this.state.checkLNameInputChange ? (
												<Animatable.View animation='bounceIn'>
													<Feather
														name='check-circle'
														color='green'
														size={20}
													/>
												</Animatable.View>
											) : null}
										</View>

										{/* --------buttons------- */}
										<View style={{ flex: 1, marginTop: 30 }}>
											<CustomActionButton
												style={[
													styles.button,
													{ backgroundColor: colors.bgUserLogin },
												]}
												title='Continue'
												onPress={this.onContinue}>
												<Text style={{ fontWeight: 'bold', color: 'white' }}>
													Continue
												</Text>
											</CustomActionButton>
										</View>
									</View>
								)}
							</View>
							{/* --------------EOB-------------- */}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const mapDispatchToProps = dispatch => {
	return {
		signIn: user => dispatch({ type: 'SIGN_IN', payload: user }),
		signOut: () => dispatch({ type: 'SIGN_OUT' }),
	}
}

export default connect(null, mapDispatchToProps)(SignUpScreen)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bgUserLogin,
		paddingTop: Platform.OS == 'android' ? 50 : 0,
	},
	header: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingHorizontal: 20,
		paddingVertical: 50,
	},
	footer: {
		flex: 3,
		backgroundColor: 'white',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	textHeader: {
		color: 'white',
		fontSize: 30,
		fontWeight: 'bold',
	},
	textFooter: {
		color: colors.bgUserLogin,
		fontSize: 18,
		fontWeight: 'bold',
	},
	action: {
		flexDirection: 'row',
		marginTop: 10,
		marginBottom: 30,
		borderBottomWidth: 1,
		borderBottomColor: '#f2f2f2',
		paddingBottom: 5,
	},
	textInput: {
		flex: 1,
		paddingLeft: 10,
		color: colors.bgUserLogin,
	},
	button: {
		borderColor: colors.bgPrimary,
		borderWidth: 0.5,
		borderRadius: 20,
		alignSelf: 'center',
		width: '80%',
	},
})
