import React from 'react'
import { View, Text, Modal, ScrollView, StyleSheet, Button } from 'react-native'
import colors from '../assets/colors'
import CustomActionButton from '../components/CustomTempButton'

export default class PopUpPolicy extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<Modal
				transparent={true}
				visible={this.props.visible}
				animationType='fade'>
				<View style={styles.modalContainer}>
					<ScrollView style={{ flex: 1 }}>{this.props.children}</ScrollView>
					<CustomActionButton
						style={[styles.button, { backgroundColor: 'transparent' }]}
						onPress={this.props.onClosePolicy}>
						<Text
							style={{
								fontWeight: 'bold',
								fontSize: 19,
								color: colors.bgUserLogin,
							}}>
							Close
						</Text>
					</CustomActionButton>
				</View>
			</Modal>
		)
	}
}

const styles = StyleSheet.create({
	modalContainer: {
		backgroundColor: colors.bgPrimary,
		margin: 50,
		paddingTop: 30,
		paddingHorizontal: 30,
		paddingBottom: 10,
		borderRadius: 10,
		flex: 1,
	},
	button: {
		borderColor: colors.bgPrimary,
		borderWidth: 0.5,
		borderRadius: 20,
		marginBottom: 10,
		marginTop: 20,
		alignSelf: 'center',
		width: "30%"
	},
})
