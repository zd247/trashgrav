import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import colors from '../assets/colors'
import { normalize } from '../helpers/fontHelper'

const OrderSummary = ({
	item,
	children,
	marginVertical,
	editable,
	onPress,
}) => (
	<View style={[styles.OrderSummaryContainer, { marginVertical }]}>
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
					<Image
						source={require('../assets/recycle_icon.png')}
						style={styles.image}
					/>
				)}
			</TouchableOpacity>
		</View>
		{children}
	</View>
)

OrderSummary.defaultProps = {
	marginVertical: 5,
	editable: false,
}

export default OrderSummary

const styles = StyleSheet.create({
	OrderSummaryContainer: {
		minHeight: normalize(100),
		flexDirection: 'row',
		backgroundColor: 'white',
		borderBottomWidth: 0.3,
		alignItems: 'center',
	},
	imageContainer: {
		height: normalize(70),
		width: normalize(70),
		marginLeft: normalize(10),
	},
	image: {
		flex: 1,
		height: null,
		width: null,
		borderRadius: normalize(35),
	},
})
