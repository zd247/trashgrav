import React, { useState } from 'react'
import { SafeAreaView, Text, StyleSheet, View } from 'react-native'
import CustomActionButton from '../components/CustomTempButton'
import colors from '../assets/colors'
import { normalize } from '../helpers/fontHelper'


import {
	CodeField,
	Cursor,
	useBlurOnFulfill,
	useClearByFocusCell,
} from 'react-native-confirmation-code-field'

const CELL_COUNT = 6

const CodeInputLayout = props => {
	const [value, setValue] = useState('')
	const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT })
	const [handlers, getCellOnLayoutHandler] = useClearByFocusCell({
		value,
		setValue,
	})

	const codeInputHandler = enteredValue => {
		setValue(enteredValue)
	}

	const setInputIntoProps = () => {
		props.onInput(value)
	}

	return (
		<View>
			<SafeAreaView style={styles.root}>
				<CodeField
					ref={ref}
					{...handlers}
					value={value}
					onChangeText={codeInputHandler}
					cellCount={CELL_COUNT}
					rootStyle={styles.codeFiledRoot}
					keyboardType='number-pad'
					renderCell={({ index, symbol, isFocused }) => (
						<Text
							key={index}
							style={[styles.cell, isFocused && styles.focusCell]}
							onLayout={getCellOnLayoutHandler(index)}>
							{symbol || (isFocused ? <Cursor /> : null)}
						</Text>
					)}
				/>
			</SafeAreaView>

			<CustomActionButton
				style={[
					styles.button,
					{ backgroundColor: colors.bgUserLogin, marginTop: normalize(100) },
				]}
				title='Verify'
				onPress={setInputIntoProps}>
				<Text style={{ fontWeight: 'bold', color: 'white' }}>Verify</Text>
			</CustomActionButton>
		</View>
	)
}

export default CodeInputLayout

const styles = StyleSheet.create({
	root: { flex: 1, padding: normalize(20) },
	codeFiledRoot: { marginTop: normalize(20) },
	cell: {
		width: normalize(40),
		height: normalize(40),
		lineHeight: normalize(38),
		fontSize: normalize(24),
		borderWidth: 2,
		borderColor: '#00000030',
		textAlign: 'center',
	},
	focusCell: {
		borderColor: '#000',
	},
	button: {
		borderColor: colors.bgPrimary,
		borderWidth: 0.5,
		borderRadius: normalize(30),
		marginBottom: normalize(10),
		alignSelf: 'center',
		width: '80%',
		height: normalize(42)
	},
})
