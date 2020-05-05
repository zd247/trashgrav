import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import colors from '../assets/colors'
import { normalize } from '../helpers/fontHelper'

const ItemList = ({ item, children, marginVertical, editable, onPress }) => (
	<View style={[styles.ItemListContainer, { marginVertical }]}>
		<View style={styles.imageContainer}>
			<TouchableOpacity
				disabled={!editable}
				style={{ flex: 1 }}
				onPress={() => onPress(item)}>
				{item.image ? (
					<Image
						source={{ uri: item.image }}
						style={styles.image}
						// indicator={ProgressPie}
						indicatorProps={{
							size: normalize(40),
							borderWidth: 0,
							color: colors.logoColor,
							unfilledColor: 'rgba(200,200,200,0.2)',
						}}
						imageStyle={{ borderRadius: 35 }}
					/>
				) : (
					<Image source={require('../assets/icon.png')} style={styles.image} />
				)}
			</TouchableOpacity>
		</View>
		<View style={styles.ItemListTitleContainer}>
			<Text style={styles.ItemListTitle}>{item.key}</Text>
		</View>
		{children}
	</View>
)

ItemList.defaultProps = {
	marginVertical: normalize(5),
	editable: false,
}

export default ItemList

const styles = StyleSheet.create({
	ItemListContainer: {
		minHeight: normalize(100),
		flexDirection: 'row',
		backgroundColor: '#fbfbf1',
		alignItems: 'center',
		borderWidth: 0.15,
		borderRadius: normalize(10),
		padding: normalize(10),
	},
	imageContainer: {
		height: normalize(120),
		width: normalize(120),
	},
	image: {
		width: '100%',
		height: '100%',
		borderWidth: normalize(5),
		borderColor: 'white',
		borderRadius: normalize(10),
	},
	ItemListTitleContainer: {
		flex: 1,
		justifyContent: 'center',
		paddingLeft: normalize(5),
	},
	ItemListTitle: {
		fontWeight: '100',
		fontSize: normalize(20),
		color: 'black',
		marginStart: normalize(10),
	},
})
