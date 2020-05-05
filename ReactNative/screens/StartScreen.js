import React from 'react'
import {
	View,
	StyleSheet,
	StatusBar,
	Image,
	Text,
	SafeAreaView,
	Dimensions,
	YellowBox
} from 'react-native'

import _ from 'lodash'
import * as Animatable from 'react-native-animatable'

import ErrorBoundary from '../components/ErrorBoundary'
import CustomActionButton from '../components/CustomTempButton'

import colors from '../assets/colors'
import { normalize } from '../helpers/fontHelper'

const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height

export default class StartScreen extends React.Component {
	constructor() {
		super()
		YellowBox.ignoreWarnings(['Setting a timer'])
		YellowBox.ignoreWarnings(['Warning: "RootErrorBoundary": Error boundaries'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('Setting a timer') <= -1) {
				_console.warn(message)
			}
			if (message.indexOf('Warning: "RootErrorBoundary": Error boundaries') <= -1) {
				_console.warn(message)
			}
		}
	}

	handleAdminLogin = () => {
		this.props.navigation.navigate('AdminLoginScreen')
	}

	render() {
		return (
			<ErrorBoundary>
				<View style={styles.container}>
					<SafeAreaView />
					<StatusBar barStyle='light-content' />
					<Animatable.View style={styles.header} animation='fadeInDown'>
						<Image
							style={{
								width: screenWidth / 2,
								height: screenWidth / 2,
								borderRadius: screenWidth / 4,
							}}
							source={require('../assets/logo.png')}
						/>
					</Animatable.View>

					{/* -------footer------- */}
					<Animatable.View animation='fadeInUp' style={styles.footer}>
						<Text style={styles.textFooter}>
							Let's make our environment clean!{' '}
						</Text>
						<Text
							style={{
								marginTop: '15%',
								color: 'grey',
							}}>
							Shall we continue as an ...
						</Text>

						<View
							style={{
								flex: 2,
								marginTop: '5%',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								marginHorizontal: normalize(20)
							}}>
							<CustomActionButton
								style={[
									styles.button,
									{ backgroundColor: colors.bgAdminLogin },
								]}
								title='Admin'
								onPress={this.handleAdminLogin}>
								<Text style={{ fontWeight: 'bold', color: 'white' }}>
									ADMIN
								</Text>
							</CustomActionButton>
							<CustomActionButton
								style={[styles.button, { backgroundColor: colors.bgUserLogin }]}
								title='User'
								onPress={() => this.props.navigation.navigate('LoginScreen')}>
								<Text style={{ fontWeight: 'bold', color: 'white' }}>USER</Text>
							</CustomActionButton>
						</View>
					</Animatable.View>
					<SafeAreaView />
				</View>
			</ErrorBoundary>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#05375a',
	},
	header: {
		flex: 1,
		justifyContent: 'center',
		alignSelf: 'center',
	},
	footer: {
		flex: 1,
		backgroundColor: 'white',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: '8%',
		paddingTop: '10%',
	},
	textFooter: {
		color: '#05375a',
		fontSize: normalize(25),
		fontWeight: 'bold',
	},
	button: {
		borderColor: colors.bgPrimary,
		borderWidth: 0.5,
		borderRadius: 70,
		alignSelf: 'center',
		width: screenWidth * 0.3,
		height: screenHeight * 0.08,
	},
})
