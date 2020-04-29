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
} from 'react-native'

import Feather from 'react-native-vector-icons/Feather'
import * as Animatable from 'react-native-animatable'

import colors from '../assets/colors'
import strings from '../assets/strings'

import _ from 'lodash'
import { connect } from 'react-redux'
import ErrorBoundary from '../components/ErrorBoundary'
import CustomActionButton from '../components/CustomTempButton'
import PopUpPolicy from '../components/PopUpPolicy'
import InputField from '../components/InputField'
import PwdField from '../components/PwdField'

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
					marginTop: 50,
					marginHorizontal: 20,
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
			password: '',
		}
		YellowBox.ignoreWarnings(['Setting a timer'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('Setting a timer') <= -1) {
				_console.warn(message)
			}
		}
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

	passwordInputChange = text => {
		this.setState({ password: text })
	}

	onResetPassword = () => {
		// TODO: reset password just by confirming new one.
	}


	onContinue = () => {
		this.setState({ loading: true })
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
				.on('value', snapshot => {
					if (snapshot.exists()) {
						snapshot.forEach(data => {
							if (data.child('password').val() === this.state.password) {
								// this.props.signIn(data)
								console.log(data.child('phone'))
								console.log(data.key)
								console.log(data)
								this.setState({ loading: false })
								//TODO: navigate to UserHomeScreen
							} else {
								alert('Password is invalid, please re-enter')
								this.setState({ password: '' })
								this.setState({ loading: false })
							}
						})
					} else {
						alert('Phone number is invalid, please re-enter')
						this.setState({ password: '' })
						this.setState({ loading: false })
					}
				})
		}
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
										fontAwesomeIcon = 'phone-square'
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

									<Text
										onPress={this.onResetPassword}
										style={{ color: '#009bd1' }}>
										Forgot password ?
									</Text>

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
const mapDispatchToProps = dispatch => {
	return {
		signIn: user => dispatch({ type: 'SIGN_IN', payload: user }),
		signOut: () => dispatch({ type: 'SIGN_OUT' }),
	}
}

// navigation
export default connect(null, mapDispatchToProps)(LoginScreen)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bgUserLogin,
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
	button: {
		borderColor: colors.bgPrimary,
		borderWidth: 0.5,
		borderRadius: 20,
		marginBottom: 10,
		alignSelf: 'center',
		width: '80%',
	},
	modalContainer: {
		backgroundColor: colors.bgPrimary,
		margin: 50,
		padding: 30,
		borderRadius: 10,
		flex: 1,
	},
})
