import React, { Component } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ImageBackground,
} from 'react-native'

import CustomActionButton from '../components/CustomTempButton'
import colors from '../assets/colors'
import { Ionicons } from '@expo/vector-icons'
import { connect } from 'react-redux'
import * as firebase from 'firebase/app'
import 'firebase/auth'

class SettingScreen extends Component {
	signOut = async () => {
		try {
			await firebase.auth().signOut()
			this.props.onsignOut()
		} catch (error) {
			alert('Unable to sign out right now')
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				<View style={styles.header}>
					<ImageBackground
						source={require('../assets/header.png')}
						style={styles.imageBackground}
						resizeMode='stretch'>
						<TouchableOpacity
							onPress={() => this.props.navigation.openDrawer()}>
							<Ionicons name='ios-menu' size={30} color='white' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>SETTINGS</Text>
					</ImageBackground>
				</View>
				<View style={{ flex: 1 }}>
					<View style={styles.bodyContent}>
						<Text>Notifications</Text>
					</View>
					<View style={styles.bodyContent}>
						<Text>Support</Text>
					</View>
					<View style={styles.bodyContent}>
						<Text>Legal and Regulations</Text>
					</View>
					<View style={{ flex: 0.1 }}>
						<TouchableOpacity></TouchableOpacity>
					</View>
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
		onsignOut: () => dispatch({ type: 'SIGN_OUT' }),
		changeDriverMode: () => dispatch({ type: 'CHANGE_TO_DRIVER_MODE' }),
		changeCustomerMode: () => dispatch({ type: 'CHANGE_TO_CUSTOMER_MODE' }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingScreen)

const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	header: {
		flex: 0.15,
		borderWidth: 0.5,
	},
	imageBackground: {
		width: screenWidth * 0.45,
		height: 70,
		justifyContent: 'space-evenly',
		paddingTop: 20,
		flexDirection: 'row',
	},
	headerTitle: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 18,
	},
	bodyContent: {
		flex: 0.28,
		borderWidth: 0.5,
	},
})
