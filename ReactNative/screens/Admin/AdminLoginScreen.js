import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	SafeAreaView,
	Dimensions,
	TouchableOpacity,
	YellowBox,
} from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

import _ from 'lodash'
import colors from '../../assets/colors'
import * as Animatable from 'react-native-animatable'
import InputField from '../../components/InputField'
import PwdField from '../../components/PwdField'

import { connect } from 'react-redux'

import * as firebase from 'firebase/app'
import 'firebase/auth'

const screenWidth = Dimensions.get('screen').width

class AdminLoginScreen extends React.Component {
	constructor() {
		super()
		this.state = {
			email: '',
			password: '',
			checkEmailInputText: false,
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
	}

	onContinue = async () => {
		if (this.state.checkEmailInputText && this.state.password.length >= 6) {
			try {
				const response = await firebase
					.auth()
					.signInWithEmailAndPassword(this.state.email, this.state.password)
				if (response) {
					this.props.changeAdminMode()
					console.log(this.props.auth.isAdmin)
					console.log('admin logged in !')
					this.props.signIn(response.user)
				}
			} catch (e) {
				console.log(e)
				alert(e)
			}
		}
	}

	render() {
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
										<Feather name='check-circle' color='green' size={20} />
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
									<Feather name='arrow-right' color='white' size={25} />
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
		paddingVertical: 60,
	},
	footer: {
		flex: 1,
		backgroundColor: 'white',
		borderRadius: 35,
		marginHorizontal: 15,
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	textHeader: {
		color: 'white',
		fontSize: 30,
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
