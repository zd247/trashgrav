import React, { Component } from 'react'
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableOpacity,
	TextInput,
	FlatList,
	ImageBackground,
	Modal,
	YellowBox,
	Alert,
	Dimensions,
	ScrollView,
	ActivityIndicator,
} from 'react-native'
import { render } from 'react-dom'

import _ from 'lodash'

import ListItem from '../components/ItemList'
import OrderSummary from '../components/OrderSummary'
import { snapshotToArray } from '../helpers/firebaseHelpers'
import { Ionicons } from '@expo/vector-icons'
import colors from '../assets/colors'

import { connect } from 'react-redux'
import { normalize } from '../helpers/fontHelper'

import * as firebase from 'firebase/app'
import 'firebase/storage'

import NumericInput from 'react-native-numeric-input'
import SelectPicker from 'react-native-form-select-picker'

import { userCache } from '../helpers/cacheHelper'

class HomeScreen extends Component {
	constructor() {
		super()
		this.state = {
			recycleItemListTemp: [],
			search: '',
			recycleCart: [],
			currentUser: {},
			isModalVisible: false,
			totalWeight: 0,
			totalPrice: 0,
			tempInt: 1,
			isFetching: false,
			isLoading: false,
			paymentOption: 'cash',
			isButtonDisabled: false,
		}

		YellowBox.ignoreWarnings(["Warning: Can't perform a React state "])
		YellowBox.ignoreWarnings([
			'Warning: componentWillReceiveProps has been renamed',
		])
		const _console = _.clone(console)
		console.warn = message => {
			if (message.indexOf("Warning: Can't perform a React state ") <= -1) {
				_console.warn(message)
			}
			if (
				message.indexOf(
					'Warning: componentWillReceiveProps has been renamed'
				) <= -1
			) {
				_console.warn(message)
			}
		}
	}

	componentDidMount = async () => {
		// const user = await userCache.get('data')
		const user = this.props.currentUser

		console.log('mounted')
		

		const currentUserData = await firebase
			.database()
			.ref('Users')
			.child(user.uid)
			.once('value')

		const recycleItems = await firebase.database().ref('Items').once('value')
		let recycleItemsArray = snapshotToArray(recycleItems)


		let temp = currentUserData.val()
		delete temp['password']

		this.setState({
			currentUser: temp,
			recycleItemListTemp: recycleItemsArray,
		})

		this.props.loadUser(temp)
		this.props.loadRecycleItem(recycleItemsArray)

		//reset cart and list state
		this.props.recycleItemList.recycleItemList.isAdded = false
		this.props.recycleItemList.recycleCart = []
		this.props.updateOrderWeight(0)
		this.props.updateOrderPrice(0)
		this.setState({ isLoading: false })
		this.props.toggleIsLoadingItems(false)
	}

	onRefreshData = async () => {
		this.setState({ isFetching: true })
		const recycleItems = await firebase.database().ref('Items').once('value')
		let recycleItemsArray = snapshotToArray(recycleItems)

		this.props.loadRecycleItem(recycleItemsArray)

		this.setState({ recycleItemListTemp: recycleItemsArray })
		this.setState({ isFetching: false })
	}

	toggleModal = () => {
		this.setState({ isModalVisible: !this.state.isModalVisible })
	}

	searchItem = text => {
		let data = []
		this.state.recycleItemListTemp.map(function (value) {
			if (value.key.indexOf(text.toLowerCase()) > -1) {
				data.push(value)
			}
		})
		this.props.loadRecycleItem(data)
		this.setState({ search: text })
	}

	chooseItem = (selectedItem, index) => {
		let newList = this.props.recycleItemList.recycleItemList.filter(
			recycleItem => recycleItem.key == selectedItem.key
		)

		selectedItem.isAdded = true

		delete newList[0].description
		newList[0].weight = this.state.tempInt

		var interger = 0
		if (typeof newList[0].price === 'string') {
			interger = parseInt(newList[0].price, 10)
			newList[0].price = interger
		}
		this.props.moveItemToCart(newList[0])
		//this.calculateOrderTotal();
	}

	removeItem = (selectedItem, index) => {
		let tempList = this.props.recycleItemList.recycleCart.filter(
			recycleItem => recycleItem == selectedItem
		)
		selectedItem.isAdded = false

		this.props.deleteItem(tempList[0])

		if (this.props.recycleItemList.totalWeight < 5) {
			this.setState({ isButtonDisabled: false })
		}
		//this.calculateOrderTotal();
	}

	updateOrderDetail = (item, num) => {
		let newWeight
		if (typeof num === 'string') {
			newWeight = parseInt(num, 10)
		} else {
			newWeight = num
		}
		let tempList = this.props.recycleItemList.recycleCart
		tempList.forEach(element => {
			if (element.category == item.category) {
				element.weight = newWeight
			}
		})
		this.props.updateOrder(tempList)
		this.calculateOrderTotal()
	}

	calculateOrderTotal() {
		let i
		let tempWeight = 0
		let tempPrice = 0
		let interger = 0
		let tempList = this.props.recycleItemList.recycleCart
		for (i = 0; i < tempList.length; i++) {
			if (typeof tempList[i].weight === 'string') {
				interger = parseInt(tempList[i].weight, 10)
				tempList[i].weight = interger
			}
			tempWeight += tempList[i].weight
			tempPrice = tempPrice + tempList[i].weight * tempList[i].price
		}
		this.props.updateOrderWeight(tempWeight)
		this.props.updateOrderPrice(tempPrice)
		if (tempWeight > 5) {
			//this.setState({ isButtonDisabled: true });
			return Alert.alert(
				'The total weight cannot be heavier than 5 kg. Please remove some of your item in the cart or decrease its weight value'
			)
		}
	}

	componentWillUnmount = () => {
		console.log('[HomeScreen] component umounted')
		firebase.database().ref('Items').off()
	}

	renderRecycleItemList = (item, index) => (
		<ListItem item={item}>
			<View style={{ flexDirection: 'column', alignItems: 'center' }}>
				{!item.isAdded ? (
					<TouchableOpacity
						onPress={() => this.chooseItem(item, index)}
						style={{
							paddingHorizontal: normalize(10),
							paddingVertical: normalize(20),
						}}>
						<Ionicons name='ios-add' color='green' size={normalize(40)} />
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={() => this.removeItem(item, index)}
						style={{
							paddingHorizontal: normalize(10),
							paddingVertical: normalize(20),
						}}>
						<Ionicons name='ios-remove' color='red' size={normalize(40)} />
					</TouchableOpacity>
				)}

				<TouchableOpacity
					style={{
						paddingHorizontal: normalize(10),
						paddingVertical: normalize(20),
					}}
					onPress={() => {
						this.props.navigation.navigate('ItemScreen', { item })
					}}>
					<Ionicons
						name='ios-information-circle'
						color='green'
						size={normalize(30)}
					/>
				</TouchableOpacity>
			</View>
		</ListItem>
	)

	renderOrderSummary = (item, index) => (
		<OrderSummary item={item}>
			<View
				style={{
					flex: 1,
					justifyContent: 'space-between',
					flexDirection: 'row',
				}}>
				<View
					style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
					<Text
						style={{
							fontSize: normalize(22),
							padding: normalize(5),
							color: '#777e74',
						}}>
						{item.key}
					</Text>
					<View style={{ padding: normalize(5) }}>
						<NumericInput
							value={item.weight}
							onChange={value => this.updateOrderDetail(item, value)}
							step={0.5}
							valueType='real'
							maxValue={5}
							minValue={0}
							rounded
							textColor={colors.bgUserLogin}
							iconStyle={{ color: 'white' }}
							rightButtonBackgroundColor='#a7b0a2'
							leftButtonBackgroundColor='#d7e2d0'
							editable={false}
						/>
					</View>
				</View>
				<TouchableOpacity
					style={{ paddingRight: normalize(20) }}
					onPress={() => this.removeItem(item, index)}>
					<Ionicons name='ios-remove' size={normalize(30)} color='red' />
				</TouchableOpacity>
			</View>
		</OrderSummary>
	)

	requestDriver = () => {
		this.calculateOrderTotal()

		if (this.props.recycleItemList.totalWeight <= 5) {
			this.setState({ isModalVisible: false })
			this.props.navigation.navigate('CustomerMapScreen')
		} else {
			alert(
				'The total weight cannot be heavier than 5 kg. Please remove some of your item in the cart or decrease its weight value'
			)
		}
	}

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				{/* ------------header------------- */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => this.props.navigation.openDrawer()}
						style={{ flex: 1 }}>
						<Ionicons
							name='ios-menu'
							size={normalize(30)}
							color='white'
							style={{ marginLeft: normalize(10) }}
						/>
					</TouchableOpacity>
					<Text style={styles.headerTitle}>
						Hello {this.props.recycleItemList.user.first_name} ~
					</Text>
				</View>

				{/* ------------body content------------- */}
				<View style={{ flex: 1 }}>
					<View style={{ flexDirection: 'row', paddingStart: normalize(10) }}>
						<View style={styles.section}>
							<TextInput
								placeholder='Search..'
								style={{ flex: 1, marginLeft: 10 }}
								value={this.state.search}
								autoCapitalize='none'
								onChangeText={text => this.searchItem(text)}
							/>
							<TouchableOpacity
								onPress={() => this.searchItem('')}
								style={{ paddingHorizontal: 10 }}>
								<Ionicons name='ios-close' color='gray' size={normalize(20)} />
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							onPress={this.toggleModal}
							style={{ paddingHorizontal: normalize(17), alignSelf: 'center' }}>
							<Ionicons name='ios-cart' color='green' size={normalize(40)} />
						</TouchableOpacity>
					</View>
					<FlatList
						data={this.props.recycleItemList.recycleItemList}
						renderItem={({ item, index }) =>
							this.renderRecycleItemList(item, index)
						}
						onRefresh={() => this.onRefreshData()}
						refreshing={this.state.isFetching}
						keyExtractor={(item, index) => index.toString()}
						ListEmptyComponent={
							<View style={{ marginTop: 50, alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>
									No Recycle Item Currently Exist In this List
								</Text>
							</View>
						}
					/>
				</View>

				{/* -----------cart modal----------- */}

				<Modal
					style={{ flex: 1 }}
					visible={this.state.isModalVisible}
					animationType='slide'>
					<SafeAreaView />
					{this.state.isLoading ? (
						<View
							style={[
								StyleSheet.absoluteFill,
								{
									alignItems: 'center',
									justifyContent: 'center',
									zIndex: 1000,
									elevation: 1000,
								},
							]}>
							<ActivityIndicator size='large' color={colors.logoColor} />
						</View>
					) : null}
					<View style={styles.modalContainer}>
						{/* ------header------ */}
						<View
							style={{
								flexDirection: 'row',
								flex: 0.1,
								borderBottomColor: colors.bgUserLogin,
								borderBottomWidth: 0.8,
								paddingBottom: normalize(10),
							}}>
							<ImageBackground
								source={require('../assets/header.png')}
								style={styles.imageBackground}
								resizeMode='stretch'>
								<TouchableOpacity onPress={this.toggleModal}>
									<Ionicons
										name='ios-close'
										size={normalize(35)}
										color='white'
									/>
								</TouchableOpacity>
								<Text style={styles.headerModalTitle}>SUMMARY</Text>
							</ImageBackground>
						</View>
						{/* ------item list------ */}

						<View style={[styles.sectionContainer, { flex: 0.65 }]}>
							<FlatList
								data={this.props.recycleItemList.recycleCart}
								renderItem={({ item, index }) =>
									this.renderOrderSummary(item, index)
								}
								keyExtractor={(item, index) => index.toString()}
								ListEmptyComponent={
									<View
										style={{
											marginTop: normalize(50),
											alignItems: 'center',
										}}>
										<Text style={{ fontWeight: 'bold' }}>
											No Recycle Item Currently Exist In this List
										</Text>
									</View>
								}
							/>
						</View>
						{/* ------text summary------ */}
						<View style={{ flex: 0.08 }}>
							<View
								style={{
									flexDirection: 'row',
									alignSelf: 'flex-end',
									alignItems: 'flex-end',
									marginEnd: normalize(40),
								}}>
								<Text
									style={{
										fontSize: normalize(11),
										color: 'silver',
										marginEnd: normalize(6),
									}}>
									Total Weight{' '}
								</Text>
								<Text style={{ fontSize: normalize(15), fontWeight: 'bold' }}>
									{this.props.recycleItemList.totalWeight} kg
								</Text>
							</View>
							<View
								style={{
									flexDirection: 'row',
									alignSelf: 'flex-end',
									alignItems: 'flex-end',
									marginEnd: normalize(40),
								}}>
								<Text
									style={{
										fontSize: normalize(11),
										color: 'silver',
										marginEnd: normalize(6),
									}}>
									Total Earning{' '}
								</Text>
								<Text style={{ fontSize: normalize(15), fontWeight: 'bold' }}>
									{this.props.recycleItemList.totalPrice}$
								</Text>
							</View>
						</View>
						{/* ------text summary------ */}
						<View style={[styles.sectionContainer, { flex: 0.1 }]}>
							<View
								style={{
									paddingVertical: normalize(5),
									paddingHorizontal: normalize(20),
									flexDirection: 'row',
									alignItems: 'center',
								}}>
								<Text
									style={{
										fontSize: normalize(18),
										fontWeight: '100',
										color: '#8f978b',
									}}>
									Payment option:
								</Text>
								<SelectPicker
									onValueChange={value => {
										this.setState({
											paymentOption: value,
										})
									}}
									style={{ borderBottomWidth: 0.5 }}
									selected={this.state.paymentOption}>
									<SelectPicker.Item label='Cash' value='cash' />
									<SelectPicker.Item label='Visa' value='visa' />
									<SelectPicker.Item label='Debit' value='debit' />
									<SelectPicker.Item label='Mastercard' value='mastercard' />
								</SelectPicker>
							</View>
						</View>
						{/* ------text summary------ */}
						<View
							style={{
								flex: 0.2,
								borderTopWidth: 0.8,
								borderTopColor: colors.bgUserLogin,
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignContent: 'center',
							}}>
							<TouchableOpacity
								style={styles.modalButton}
								onPress={() => {
									this.props.navigation.replace('Recycle Item List')
									this.setState({ isLoading: true })
								}}>
								<Text style={{ color: 'red', fontSize: normalize(26) }}>
									Cancel
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.modalButton}
								onPress={this.requestDriver}
								disabled={this.state.isButtonDisabled}>
								<Text style={{ color: 'green', fontSize: normalize(26) }}>
									Book
								</Text>
							</TouchableOpacity>
						</View>
					</View>

					<SafeAreaView />
				</Modal>

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
		loadRecycleItem: recycleItemList =>
			dispatch({
				type: 'LOAD_RECYCLE_ITEMS_FROM_SERVER',
				payload: recycleItemList,
			}),
		loadUser: user =>
			dispatch({
				type: 'LOAD_USER_FROM_SERVER',
				payload: user,
			}),
		moveItemToCart: item =>
			dispatch({ type: 'ADD_RECYCLE_ITEMS_TO_CART', payload: item }),
		toggleIsLoadingItems: bool =>
			dispatch({ type: 'TOGGLE_IS_LOADING_ITEMS', payload: bool }),
		deleteItem: item =>
			dispatch({ type: 'REMOVE_RECYCLE_ITEMS_FROM_CART', payload: item }),
		updateOrder: order => dispatch({ type: 'UPDATE_ORDER', payload: order }),
		updateOrderWeight: item =>
			dispatch({ type: 'UPDATE_ORDER_TOTAL_WEIGHT', payload: item }),
		updateOrderPrice: item =>
			dispatch({ type: 'UPDATE_ORDER_TOTAL_PRICE', payload: item }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen)

const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	header: {
		height: normalize(60),
		borderBottomWidth: 0.5,
		backgroundColor: 'green',
		borderBottomColor: 'silver',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
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
	headerTitle: {
		fontSize: normalize(24),
		color: 'white',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
	},
	section: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '82%',
		paddingVertical: normalize(5),
		paddingHorizontal: normalize(10),
		borderRadius: 10,
		backgroundColor: '#f2f2f2',
		marginVertical: normalize(10),
	},
	listEmptyComponent: {
		marginTop: normalize(50),
		alignItems: 'center',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: 'white',
	},
	sectionContainer: {
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		backgroundColor: 'white',
		borderRadius: 5,
		margin: normalize(15),
	},
	modalButton: {
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		backgroundColor: '#f8fdf5',
		borderRadius: 5,
		margin: normalize(15),
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

//git push --set-upstream origin master
// cd ~/.expo/ios-simulator-app-cache
// ./start_simulators.sh
