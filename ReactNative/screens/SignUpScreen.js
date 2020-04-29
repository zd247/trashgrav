import React, { Component } from 'react'
import {
	View,
	Text,
	StyleSheet,
	Platform,
	ActivityIndicator,
	ScrollView,
	StatusBar,
	YellowBox,
	SafeAreaView,
} from 'react-native'

import Feather from 'react-native-vector-icons/Feather'
import * as Animatable from 'react-native-animatable'
import _ from 'lodash'

import colors from '../assets/colors'

import CodeInputLayout from '../components/CodeInputLayout'
import CustomActionButton from '../components/CustomTempButton'
import InputField from '../components/InputField'
import PwdField from '../components/PwdField'

import { connect } from 'react-redux'
import { signInWithPhoneNumber } from '../helpers/phoneAuthentication'

import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

// https://medium.com/@danielkrom/react-set-state-after-async-task-8d2997a26c57
// or write this in native code.

class SignUpScreen extends Component {
	constructor() {
		super()
		this.state = {
			firstName: '',
			lastName: '',
			phoneNumber: '',
			password: '',
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

	passwordInputChange = text => {
		this.setState({ password: text })
	}

	nameTextInputChange = (firstName, value) => {
		if (value.length >= 1) {
			this.setState(
				firstName
					? { checkFNameInputChange: true }
					: { checkLNameInputChange: true }
			)
		} else {
			this.setState(
				firstName
					? { checkFNameInputChange: false }
					: { checkLNameInputChange: false }
			)
		}
	}

	componentWillUnmount = () => {
		console.log('[SignUpScreen] components unmounted')
	}

	onContinue = () => {
		if (
			this.state.checkPhoneInputChange &&
			this.state.checkFNameInputChange &&
			this.state.checkLNameInputChange &&
			this.state.password.length >= 6
		) {
			this.setState({ isLoading: true })
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
						this.setState({ loading: false })
					} else {
						this.handleConfirmPhoneNumber(phone)
					}
				})
		} else {
			alert(
				'Please fill in the required fields and password length must be no less than 6 characters'
			)
		}
	}

	handleConfirmPhoneNumber = async phone => {
		try {
			const confirmation = await signInWithPhoneNumber(phone)
			if (confirmation) {
				this.setState({ loading: false })
				this.setState({ confirm: confirmation })
				this.setState({ phoneNumber: phone })
			} else {
				console.log('Error verifying phone number')
			}
		} catch (e) {
			console.log(e.message)
			alert(e.message)
		}
	}

	handleConfirmVerificationCode = code => {
		try {
			this.setState({ loading: true })
			let user = this.state.confirm(code)
			if (user !== null) {
				this.setState({ loading: false })
				console.log(user.uid)
				firebase.database().ref('Users').child(user.uid).set({
					uid: user.uid,
					phone: this.state.phoneNumber,
					password: this.state.password,
					first_name: this.state.firstName,
					last_name: this.state.lastName,
				})
				// this.props.signIn(user) // store user in redux
			} else {
				console.log('Error verifying object code')
			}
		} catch (error) {
			alert('Error verifying code')
			console.log(error.message)
		}
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<SafeAreaView />
				<StatusBar barStyle='light-content' />
				{/* {this.state.isLoading ? (
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
				) : null} */}
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
									<CodeInputLayout
										onInput={this.handleConfirmVerificationCode}
									/>
								) : (
									<View>
										<InputField
											title='Phone number'
											fontAwesomeIcon='phone-square'
											color={colors.bgUserLogin}
											image={true}
											placeHolder='Ex: (012) 345-6789'
											autoCapitalize='none'
											keyboardType='phone-pad'
											onInputChange={this.phoneTextInputChange}>
											{this.state.checkPhoneInputChange ? (
												<Animatable.View animation='bounceIn'>
													<Feather
														name='check-circle'
														color='green'
														size={20}
													/>
												</Animatable.View>
											) : null}
										</InputField>

										<PwdField
											color={colors.bgUserLogin}
											value={this.state.password}
											onInputChange={this.passwordInputChange}
										/>

										<InputField
											title='First name'
											color={colors.bgUserLogin}
											fontAwesomeIcon='address-card'
											placeHolder='Ex: Marcus'
											autoCapitalize='sentences'
											keyboardType='default'
											onInputChange={text => {
												this.nameTextInputChange(true, text)
											}}>
											{this.state.checkFNameInputChange ? (
												<Animatable.View animation='bounceIn'>
													<Feather
														name='check-circle'
														color='green'
														size={20}
													/>
												</Animatable.View>
											) : null}
										</InputField>

										<InputField
											title='First name'
											color={colors.bgUserLogin}
											fontAwesomeIcon='address-card'
											placeHolder='Ex: Aurelius'
											autoCapitalize='sentences'
											keyboardType='default'
											onInputChange={text => {
												this.nameTextInputChange(false, text)
											}}>
											{this.state.checkLNameInputChange ? (
												<Animatable.View animation='bounceIn'>
													<Feather
														name='check-circle'
														color='green'
														size={20}
													/>
												</Animatable.View>
											) : null}
										</InputField>

										{/* --------buttons------- */}
										<View style={{ flex: 1, marginTop: 20 }}>
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
				<SafeAreaView />
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
		paddingVertical: 40,
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
		marginVertical: 10,
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
