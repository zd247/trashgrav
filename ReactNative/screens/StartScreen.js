import React from 'react'
import {
	View,
	StatusBar,
	Image,
	Text,
	SafeAreaView,
	Dimensions,
} from 'react-native'
import * as Animatable from 'react-native-animatable'
import EStyleSheet from 'react-native-extended-stylesheet'

import ErrorBoundary from '../components/ErrorBoundary'
import CustomActionButton from '../components/CustomTempButton'

import colors from '../assets/colors'

const screenWidth = Dimensions.get('screen').width

export default class StartScreen extends React.Component {
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
						<Text style={styles.continueTitle}>
							Shall we continue as an ...
						</Text>
						<View style={styles.buttonContainer}>
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

const entireScreenWidth = Dimensions.get('window').width
EStyleSheet.build({ $rem: entireScreenWidth / 380 })

const styles = EStyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#05375a',
		paddingTop: Platform.OS == "android" ? '0rem' : '50rem',
	},
	header: {
		flex: 1,
		justifyContent: 'center',
		alignSelf: 'center',
		paddingVertical: '120rem',
	},
	footer: {
		flex: 3,
		backgroundColor: 'white',
		borderTopLeftRadius: '30rem',
		borderTopRightRadius: '30rem',
		padding: '30rem',
	},
	textFooter: {
		color: '#05375a',
		fontSize: '30rem',
		fontWeight: 'bold',
	},
	continueTitle: {
		marginTop: '15rem',
		color: 'grey',
		padding: '5rem',
		marginBottom: '20rem',
	},
	buttonContainer: {
		flex: 1,
		marginVertical: '40rem',
		marginHorizontal: '15rem',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	button: {
		flex: 4,
		borderColor: colors.bgPrimary,
		borderWidth: 0.5,
		borderRadius: 20,
		alignSelf: 'center',
		paddingHorizontal: '20rem',
		paddingVertical: '30rem',
		width: '120rem',
	},
})
