import React from 'react'
import { Text, View, TextInput, Image, Dimensions } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'

const InputField = props => {
	return (
		<View>
			<Text style={[styles.text, {color:props.color}]}>{props.title}</Text>
			<View style={styles.action}>
				<FontAwesome name={props.fontAwesomeIcon} color={props.color} size={20} />
            
            {props.image ? <Image
					style={{ marginStart: 5 }}
					source={require('../assets/vn_flag.png')}
				/> : null }

				<TextInput
					placeholder={props.placeHolder}
					style={[styles.textInput, {color: props.color}]}
					blurOnSubmit
					autoCapitalize={props.autoCapitalize}
					autoCorrect={false}
					keyboardType={props.keyboardType}
					maxLength={30}
					onChangeText={text => props.onInputChange(text)}
				/>
				{props.children}
			</View>
		</View>
	)
}

export default InputField

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
