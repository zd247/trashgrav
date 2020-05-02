import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

class Requests extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Text>Requests tab</Text>
			</View>
		)
	}
}

export default Requests

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
})
