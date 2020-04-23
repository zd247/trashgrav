import React, { Component } from 'react'
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Platform,
	ActivityIndicator,
	ScrollView,
} from 'react-native'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import * as Animatable from 'react-native-animatable'

import colors from '../assets/colors'
import strings from '../assets/strings'

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
      isLoading: false,
      checkPhoneInputChange: false,
      checkFNameInputChange: false,
      checkLNameInputChange: false,
		}
  }
  
  phoneTextInputChange = value => {
		if (value.length >= 9) {
			this.setState({ checkPhoneInputChange: true })
		} else {
			this.setState({ checkPhoneInputChange: false })
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

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
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
							<Animatable.View style={styles.header} animation='flipInX'>
								<Text style={styles.textHeader}>Join our community</Text>
							</Animatable.View>

							{/* -------footer------- */}
							<Animatable.View animation='fadeInUpBig' style={styles.footer}>

								{/* ---------inputs-------- */}
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
										onChangeText={text => this.phoneTextInputChange(text)}
									/>
									{this.state.checkPhoneInputChange ? (
										<Animatable.View animation='bounceIn'>
											<Feather name='check-circle' color='green' size={20} />
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
											<Feather name='check-circle' color='green' size={20} />
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
											<Feather name='check-circle' color='green' size={20} />
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
										title='Continue'>
										<Text style={{ fontWeight: 'bold', color: 'white' }}>
											Continue
										</Text>
									</CustomActionButton>
								</View>
							</Animatable.View>
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
		marginBottom: 10,
		alignSelf: 'center',
		width: '80%',
	},
})
