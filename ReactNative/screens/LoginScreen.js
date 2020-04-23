import React, { Component } from 'react'
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	Modal,
} from 'react-native'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import * as Animatable from 'react-native-animatable'

import colors from '../assets/colors'
import strings from '../assets/strings'

import { connect } from 'react-redux'
import ErrorBoundary from '../components/ErrorBoundary'
import CustomActionButton from '../components/CustomTempButton'

import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

class LoginScreen extends Component {
	constructor() {
		super()
		this.state = {
			showTermsPolicy: false,
			showCookiePolicy: false,
			checkTextInputChange: false,
			isLoading: false,
		}
	}

	textInputChange = value => {
		if (value.length >= 9) {
			this.setState({ checkTextInputChange: true })
		} else {
			this.setState({ checkTextInputChange: false })
		}
  }

	render() {
		return (
			<ErrorBoundary>
				<View style={{ flex: 1, backgroundColor: 'white' }}>
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
								<View style={styles.header}>
									<Text style={styles.textHeader}>Recycle with us!</Text>
								</View>

								<Animatable.View animation='fadeInUpBig' style={styles.footer}>
									{/* inputs */}
									<Text style={styles.textFooter}>Phone number</Text>
									<View style={styles.action}>
										<FontAwesome
											name='phone-square'
											color={colors.bgUserLogin}
											size={20}
										/>
										<TextInput
											placeholder='Ex: (012) 345-6789'
											style={styles.textInput}
											blurOnSubmit
											autoCapitalize='none'
											autoCorrect={false}
											keyboardType='phone-pad'
											maxLength={13}
											onChangeText={text => this.textInputChange(text)}
										/>
										{this.state.checkTextInputChange ? (
											<Animatable.View animation='bounceIn'>
												<Feather name='check-circle' color='green' size={20} />
											</Animatable.View>
										) : null}
									</View>

									<View style={{ flex: 1, marginTop: 30 }}>
										<CustomActionButton
											style={[
												styles.button,
												{ backgroundColor: colors.bgUserLogin },
											]}
											title='Login'>
											<Text style={{ fontWeight: 'bold', color: 'white' }}>
												Continue
											</Text>
										</CustomActionButton>

										<CustomActionButton
											style={[
												styles.button,
												{ backgroundColor: 'transparent' },
											]}
											title='Login'>
											<Text
												style={{
													fontWeight: 'bold',
													color: colors.bgUserLogin,
												}}>
												Register
											</Text>
										</CustomActionButton>
									</View>

									<View
										style={{
											alignSelf: 'center',
											marginTop: 50,
											marginHorizontal: 20,
										}}>
										<Text>
											By using our application, you agree to our
											<Text> </Text>
											<Text
												style={{ color: colors.textLinkStd }}
												onPress={() => {
													this.setState({ showTermsPolicy: true })
												}}>
												Terms, Data policy
											</Text>
											<Text> </Text>
											and
											<Text> </Text>
											<Text
												style={{ color: colors.textLinkStd }}
												onPress={() => {
													this.setState({ showCookiePolicy: true })
												}}>
												Cookie Policy
											</Text>
											. You may receive SMS notifications from and can opt out
											at any time
										</Text>
									</View>
								</Animatable.View>

								{/* terms and policy modal pop up */}
								<Modal
									transparent={true}
									visible={this.state.showTermsPolicy}
									animationType='fade'>
									<View style={styles.modalContainer}>
										<ScrollView style={{ flex: 1 }}>
											<Text>{strings.termsPolicy}</Text>
										</ScrollView>
										<CustomActionButton
											style={[
												styles.button,
												{ backgroundColor: 'transparent' },
											]}
											onPress={() => {
												this.setState({ showTermsPolicy: false })
											}}>
											<Text
												style={{
													fontWeight: 'bold',
													color: colors.bgUserLogin,
												}}>
												Close
											</Text>
										</CustomActionButton>
									</View>
								</Modal>

								{/* cookie policy pop up  */}
								<Modal
									transparent={true}
									visible={this.state.showCookiePolicy}
									animationType='fade'>
									<View style={styles.modalContainer}>
										<ScrollView style={{ flex: 1 }}>
											<Text>{strings.cookiePolicy}</Text>
										</ScrollView>
										<CustomActionButton
											style={[
												styles.button,
												{ backgroundColor: 'transparent' },
											]}
											onPress={() => {
												this.setState({ showCookiePolicy: false })
											}}>
											<Text
												style={{
													fontWeight: 'bold',
													color: colors.bgUserLogin,
												}}>
												Close
											</Text>
										</CustomActionButton>
									</View>
								</Modal>

								{/* --------------EOB-------------- */}
							</View>
						</ScrollView>
					</View>
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
		paddingVertical: 70,
	},
	footer: {
		flex: 3,
		backgroundColor: 'white',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	logo: {
		width: 40,
		height: 40,
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
