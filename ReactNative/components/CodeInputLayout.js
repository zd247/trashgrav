import React, { useState } from 'react'
import { SafeAreaView, Text, StyleSheet, View } from 'react-native'
import CustomActionButton from '../components/CustomTempButton'
import colors from '../assets/colors'

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
  
  const codeInputHandler = (enteredValue) => {
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
					{ backgroundColor: colors.bgUserLogin, marginTop: 100 },
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
	root: { flex: 1, padding: 20 },
	codeFiledRoot: { marginTop: 20 },
	cell: {
		width: 40,
		height: 40,
		lineHeight: 38,
		fontSize: 24,
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
		borderRadius: 20,
		alignSelf: 'center',
		width: '80%',
	},
})
