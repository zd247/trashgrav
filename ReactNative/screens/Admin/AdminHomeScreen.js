import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ImageBackground,
	Dimensions,
	TouchableOpacity,
	YellowBox,
} from 'react-native'
import ScrollableTabView, {
	DefaultTabBar,
} from 'react-native-scrollable-tab-view'

import _ from 'lodash'
import colors from '../../assets/colors'
import { Ionicons } from '@expo/vector-icons'

import Items from './NavTabs/Items'
import Users from './NavTabs/Users'

import { connect } from 'react-redux'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import { normalize } from '../../helpers/fontHelper'

const screenWidth = Dimensions.get('screen').width

class AdminHomeScreen extends React.Component {
	constructor() {
		super()

		YellowBox.ignoreWarnings(['@firebase/database:'])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf('@firebase/database:') <= -1) {
				_console.warn(message)
			}
		}
	}

	adminLogOut = async () => {
		try {
			await firebase.auth().signOut()
			this.props.changeBackFromAdminMode()
			this.props.signOut()
			console.log('admin logged out')
		} catch (error) {
			alert('Unable to sign out right now')
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				<View style={styles.header}>
					<TouchableOpacity
						onPress={this.adminLogOut}
						style={{
							paddingHorizontal: normalize(10),
							position: 'absolute',
							left: '200%',
							top: normalize(35),
						}}>
						<Ionicons name='md-power' color={colors.bgAdminLogin} size={30} />
					</TouchableOpacity>
					<ImageBackground
						source={require('../../assets/admin_header_bg.png')}
						style={styles.imageBackground}
						resizeMode='contain'>
						<Text style={styles.title}>ADMIN</Text>
					</ImageBackground>
				</View>
				<View style={styles.tabbar}>
					<ScrollableTabView
						initialPage={0}
						tabBarActiveTextColor={colors.bgAdminLogin}
						renderTabBar={() => (
							<DefaultTabBar
								underlineStyle={{
									backgroundColor: colors.bgAdminLogin,
								}}
							/>
						)}>
						<Items tabLabel='Items' props={this.props} />
						<Users tabLabel='Users' props={this.props} />
					</ScrollableTabView>
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
		signOut: () => dispatch({ type: 'SIGN_OUT' }),
		changeBackFromAdminMode: () =>
			dispatch({ type: 'CHANGE_BACK_FROM_ADMIN_MODE' }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminHomeScreen)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	header: {
		position: 'absolute',
	},
	tabbar: {
		flex: 1,
		marginTop: screenWidth * 0.3,
	},
	imageBackground: {
		width: screenWidth * 0.4,
		height: screenWidth * 0.4,
		alignItems: 'center',
	},
	title: {
		color: 'white',
		marginTop: normalize(25),
		fontWeight: 'bold',
		fontSize: normalize(20),
	},
})
