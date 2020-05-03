import React, { useState } from 'react'
import {
	Text,
	View,
	TextInput,
	Dimensions,
	TouchableOpacity,
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import * as Animatable from 'react-native-animatable'
import EStyleSheet from 'react-native-extended-stylesheet'

const PwdField = props => {
	const [secureTextEntry, setSecureTextEntry] = useState(true)

	const secureTextEntryHandler = () => {
		setSecureTextEntry(!secureTextEntry)
	}

	return (
		<View>
			<Text style={[styles.text, { color: props.color }]}>
				{props.title ? props.title : 'Password'}
			</Text>
			<View style={styles.action}>
				<FontAwesome name='lock' color={props.color} size={20} />
				<TextInput
					style={[styles.textInput, { color: props.color }]}
					blurOnSubmit
					secureTextEntry={secureTextEntry}
					autoCapitalize='none'
					autoCorrect={false}
					keyboardType='default'
					maxLength={13}
					value={props.value}
					onChangeText={text => props.onInputChange(text)}
				/>
				<Animatable.View animation='bounceIn'>
					<TouchableOpacity onPress={secureTextEntryHandler}>
						{secureTextEntry ? (
							<Feather name='eye-off' color='grey' size={20} />
						) : (
							<Feather name='eye' color='grey' size={20} />
						)}
					</TouchableOpacity>
				</Animatable.View>
			</View>
		</View>
	)
}

export default PwdField


const entireScreenWidth = Dimensions.get('window').width
EStyleSheet.build({ $rem: entireScreenWidth / 380 })

const styles = EStyleSheet.create({
	text: {
		fontSize: '18rem',
		fontWeight: 'bold',
	},
	action: {
		flexDirection: 'row',
		marginVertical: '10rem',
		borderBottomWidth: '1rem',
		borderBottomColor: '#f2f2f2',
		paddingBottom: '5rem',
	},
	textInput: {
		flex: 1,
		paddingLeft: '10rem',
	},
})
