import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import colors from '../assets/colors'
import { normalize } from '../helpers/fontHelper'

const DriverOrderList = ({
	item,
	children,
	marginVertical,
	editable,
	onPress,
}) => (
	<View style={[styles.ItemListContainer, { marginVertical }]}>
		<View style={styles.imageContainer}>
			{item.user.image ? (
				<Image
					source={{ uri: item.user.image }}
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
		</View>
		<View style={{ flexDirection: 'column', justifyContent: 'center',  }}>
			<View style={styles.ItemListTitleContainer}>
				<Text style={styles.ItemListTitle}>Customer Name: </Text>
				<Text style={styles.ItemListText}>
					{item.user.first_name} {item.user.last_name}
				</Text>
			</View>
			<View style={styles.ItemListTitleContainer}>
				<Text style={styles.ItemListTitle}>Order Price: </Text>
				<Text style={styles.ItemListText}>{item.totalPrice}$</Text>
			</View>
      <View style={styles.ItemListTitleContainer}>
				<Text style={styles.ItemListTitle}>Order Weight: </Text>
				<Text style={styles.ItemListText}>{item.totalWeight} kg</Text>
			</View>
		</View>
		{children}
	</View>
)

DriverOrderList.defaultProps = {
	marginVertical: normalize(5),
	editable: false,
}

export default DriverOrderList

const styles = StyleSheet.create({
	ItemListContainer: {
		minHeight: normalize(100),
    flexDirection: 'row',
    shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		backgroundColor: '#fbfbf1',
		alignItems: 'center',
		borderWidth: 0.15,
		borderRadius: 10,
    padding: normalize(15),
    marginHorizontal: normalize(20),
    marginVertical: normalize(10),
	},
	imageContainer: {
		height: normalize(70),
		width: normalize(70),
	},
	image: {
		width: '100%',
		height: '100%',
		borderWidth: 5,
		borderColor: 'white',
		borderRadius: normalize(10),
	},
	ItemListTitleContainer: {
		flex: 1,
		paddingLeft: 2,
		flexDirection: 'row',
	},
	ItemListTitle: {
		fontWeight: 'bold',
		fontSize: normalize(15),
		color: 'silver',
		marginStart: normalize(15),
	},
	ItemListText: {
		fontWeight: '500',
		fontSize: normalize(16),
		color: 'black',
		marginStart: normalize(5),
	},
})
