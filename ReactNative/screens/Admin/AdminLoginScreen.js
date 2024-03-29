import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	Dimensions,
	TouchableOpacity,
	ActivityIndicator,
	YellowBox,
} from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

import _ from 'lodash'
import colors from '../../assets/colors'
import { normalize } from '../../helpers/fontHelper'
import * as Animatable from 'react-native-animatable'
import InputField from '../../components/InputField'
import PwdField from '../../components/PwdField'

import { connect } from 'react-redux'

import * as firebase from 'firebase/app'
import 'firebase/auth'

const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height

class AdminLoginScreen extends React.Component {
	constructor() {
		super()
		this.state = {
			email: '',
			password: '',
			checkEmailInputText: false,
			isLoading: false,
		}

		YellowBox.ignoreWarnings(['Setting a timer'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('Setting a timer') <= -1) {
				_console.warn(message)
			}
		}
	}

	handleEmailTextInputChange = text => {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (re.test(text.toLowerCase())) {
			this.setState({ checkEmailInputText: true })
			this.setState({ email: text })
		} else {
			this.setState({ checkEmailInputText: false })
			this.setState({ email: '' })
		}
	}

	handlePasswordInputChange = text => {
		this.setState({ password: text })
	}

	componentWillUnmount() {
		console.log('[AdminLoginScreen] component umounted')
		firebase.database().ref('Users').off()
	}

	onContinue = async () => {
		this.setState({ isLoading: true })
		if (this.state.checkEmailInputText && this.state.password.length >= 6) {
			//verify user info
			try {
				firebase
					.database()
					.ref('Admins')
					.orderByChild('email')
					.equalTo(this.state.email)
					.once('value', snapshot => {
						if (snapshot.exists()) {
							snapshot.forEach(data => {
								if (data.child('password').val() === this.state.password) {
									this.props.changeAdminMode()
									console.log(this.props.auth.isAdmin)
									this.props.signIn(data)
									this.setState({ isLoading: false })
								} else {
									alert('Password is invalid, please re-enter')
									this.setState({ password: '' })
									this.setState({ isLoading: false })
								}
							})
						} else {
							alert('Email is invalid, please re-enter')
							this.setState({ password: '' })
							this.setState({ isLoading: false })
						}
					})
			} catch (e) {
				console.log(e)
				alert(e)
				this.setState({ isLoading: false })
			}
		} else {
			alert('Invalid email and password format entered')
			this.setState({ isLoading: false })
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				<View style={{ flex: 1 }}>
					<ScrollView style={{ flex: 1 }}>
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
						{/* -------header------- */}
						<Animatable.View style={styles.header} animation='fadeInUpBig'>
							<Text style={styles.textHeader}>Start managing !</Text>
						</Animatable.View>
						<View style={styles.footer}>
							<InputField
								title='Email'
								fontAwesomeIcon='envelope'
								color={'#009bd1'}
								placeHolder='Ex: admin@trash.grav'
								autoCapitalize='none'
								keyboardType='email-address'
								onInputChange={this.handleEmailTextInputChange}>
								{this.state.checkEmailInputText ? (
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
								color={'#009bd1'}
								value={this.state.password}
								onInputChange={this.handlePasswordInputChange}
							/>

							<TouchableOpacity
								style={{ alignItems: 'flex-end' }}
								onPress={this.onContinue}>
								<View style={styles.button}>
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
				<SafeAreaView />
			</View>
		)
	}
}

const mapStateToProps = state => {
	return {
		auth: state.auth,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		signIn: user => dispatch({ type: 'SIGN_IN', payload: user }),
		changeAdminMode: () => dispatch({ type: 'CHANGE_TO_ADMIN_MODE' }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLoginScreen)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.bgAdminLogin,
	},
	header: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingHorizontal: '10%',
		paddingVertical: screenHeight * 0.15,
	},
	footer: {
		flex: 1,
		backgroundColor: 'white',
		borderRadius: 35,
		marginHorizontal: '4%',
		paddingHorizontal: '5%',
		paddingVertical: '8.5%',
	},
	textHeader: {
		color: 'white',
		fontSize: normalize(30),
		fontWeight: 'bold',
	},
	absolute: {
		position: 'absolute',
		width: '100%',
		height: '100%',
	},
	box: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: '4%',
	},
	button: {
		width: normalize(100),
		backgroundColor: '#4399AD',
		marginTop: normalize(15),
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: normalize(10),
	},
})
