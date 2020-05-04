import React from 'react'
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native'
import colors from '../assets/colors'
import EStyleSheet from 'react-native-extended-stylesheet'

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
							size: 40,
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
	marginVertical: 5,
	editable: false,
}

export default ItemList

const entireScreenWidth = Dimensions.get('window').width
EStyleSheet.build({ $rem: entireScreenWidth / 380 })

const styles = EStyleSheet.create({
	ItemListContainer: {
		minHeight: '100rem',
		flexDirection: 'row',
		backgroundColor: '#fbfbf1',
		alignItems: 'center',
		borderWidth: '0.15rem',
		borderRadius: '15rem',
		padding: '10rem',
	},
	imageContainer: {
		height: '120rem',
		width: '120rem',
	},
	image: {
		width: '100%',
		height: '100%',
		borderWidth: '5rem',
		borderColor: 'white',
		borderRadius: '10rem',
	},
	ItemListTitleContainer: {
		flex: 1,
		justifyContent: 'center',
		paddingLeft: '5rem',
	},
	ItemListTitle: {
		fontWeight: '100',
		fontSize: '22rem',
		color: 'black',
		marginStart: '10rem',
	},
})
