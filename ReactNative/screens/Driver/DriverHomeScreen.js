import React, { Component } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	SafeAreaView,
	Modal,
	FlatList,
	RefreshControl,
	ImageBackground,
	Image,
} from 'react-native'

import Constants from 'expo-constants'
import * as Location from 'expo-location'

import CustomActionButton from '../../components/CustomTempButton'
import DriverOrderList from '../../components/DriverOrderList'
import colors from '../../assets/colors'

import apiKey from '../../helpers/googleAPIkey'
import * as firebase from 'firebase/app'
import { snapshotToArray } from '../../helpers/firebaseHelpers'

import { Ionicons } from '@expo/vector-icons'
import { connect } from 'react-redux'
import MapView from 'react-native-maps'
import _ from 'lodash'
import { normalize } from '../../helpers/fontHelper'

class DriverHomeScreen extends Component {
	constructor(props) {
		super(props)
		this.state = {
			location: null,
			errorMessage: null,
			order: [],
			destination: '',
			refreshing: false,
		}
	}

	componentDidMount() {
		this.loadInitialOrder()
	}

	loadInitialOrder = async () => {
		const orders = await firebase.database().ref('Requests').once('value')
		const ordersArray = snapshotToArray(orders)

		let tempArray = []
		ordersArray.forEach(child => {
			if (child.status == 0) {
				tempArray.push(child)
			}
		})
		// console.log(tempArray);

		this.setState({ order: tempArray })
	}

	updateOrder = async () => {
		this.setState({ refreshing: true })
		const orders = await firebase.database().ref('Requests').once('value')
		const ordersArray = snapshotToArray(orders)

		let tempArray = []
		ordersArray.forEach(child => {
			if (child.status == 0) {
				tempArray.push(child)
			}
		})
		// console.log(tempArray);

		this.setState({ order: tempArray })
		this.setState({ refreshing: false })
	}

	renderOrder = (order, index) => (
		<TouchableOpacity
			style={{ marginTop: normalize(10) }}
			onPress={() => {this.props.navigation.navigate('Driver Order Detail Screen', {order})}}>
			<DriverOrderList item={order} />
		</TouchableOpacity>
	)

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => this.props.navigation.openDrawer()}
						style={{ flex: 1 }}>
						<Ionicons
							name='ios-menu'
							size={30}
							color='white'
							style={{ marginLeft: 10 }}
						/>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Available Orders</Text>
				</View>
				<View style={{ flex: 1 }}>
					<FlatList
						data={this.state.order}
						renderItem={({ item, index }) => this.renderOrder(item, index)}
						keyExtractor={(item, index) => index.toString()}
						refreshControl={
							<RefreshControl
								refreshing={this.state.refreshing}
								onRefresh={this.updateOrder}
							/>
						}
						ListEmptyComponent={
							<View style={{ marginTop: 50, alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>
									No Recycle Item Currently Exist In this List
								</Text>
							</View>
						}
					/>
				</View>
				<SafeAreaView />
			</View>
		)
	}
}

const mapStateToProps = state => {
	return {
		recycleItemList: state.recycleItemList,
		currentUser: state.auth.currentUser,
		//temp: state.recycleCart,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		loadUser: user =>
			dispatch({
				type: 'LOAD_USER_FROM_SERVER',
				payload: user,
			}),
		toggleIsLoadingItems: bool =>
			dispatch({ type: 'TOGGLE_IS_LOADING_ITEMS', payload: bool }),
		orderIsPickedUp: bool =>
			dispatch({ type: 'CHECK_IF_ORDER_IS_PICK_UP', payload: bool }),
		deleteItem: item =>
			dispatch({ type: 'REMOVE_RECYCLE_ITEMS_FROM_CART', payload: item }),
		updateOrderHello: order =>
			dispatch({ type: 'UPDATE_ORDER_HELLO', payload: order }),
		updateOrderWeight: item =>
			dispatch({ type: 'UPDATE_ORDER_TOTAL_WEIGHT', payload: item }),
		updateOrderLocation: location =>
			dispatch({ type: 'UPDATE_ORDER_LOCATION', payload: location }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DriverHomeScreen)

const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	changeMode: {
		width: 200,
		backgroundColor: 'transparent',
		borderWidth: 0.5,
		borderColor: colors.bgError,
		marginBottom: 20,
	},
	header: {
		backgroundColor: 'green',
		height: 70,
		borderBottomWidth: 0.5,
		borderBottomColor: colors.borderColor,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
	},
	headerTitle: {
		fontSize: 24,
		color: 'white',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
	},
	body: {
		flex: 1,
	},
	mapStyle: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
	},
	addingButton: {
		width: 100,
		height: 50,
		backgroundColor: '#a5deba',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modalContainer: {
		backgroundColor: 'white',
		margin: normalize(20),
		marginTop: normalize(40),
		borderWidth: 2.5,
		flex: 1,
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		borderRadius: normalize(10),
	},
	imageBackground: {
		width: screenWidth * 0.45,
		justifyContent: 'space-evenly',
		alignItems: 'center',
		flexDirection: 'row',
	},
	headerModalTitle: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: normalize(20),
	},
	sectionTextTitle: {
		color: colors.bgAdminLogin,
		fontWeight: 'bold',
		marginStart: normalize(10),
	},
	sectionTextContainer: {
		flexDirection: 'row',
		alignSelf: 'flex-start',
		alignItems: 'flex-start',
		marginVertical: normalize(9),
	},
	itemListContainer: {
		minHeight: normalize(100),
		flexDirection: 'row',
		backgroundColor: '#fbfbf1',
		alignItems: 'center',
		borderWidth: 0.15,
		borderRadius: normalize(10),
		padding: normalize(10),
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		flexDirection: 'row',
		marginBottom: normalize(15),
		marginHorizontal: normalize(20),
	},
	sectionImageContainer: {
		height: normalize(90),
		width: normalize(90),
	},
	sectionImage: {
		flex: 1,
		height: null,
		width: null,
		borderRadius: normalize(45),
	},
})
