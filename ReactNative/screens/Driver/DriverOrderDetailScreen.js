import React, { Component } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	FlatList,
	SafeAreaView,
	ImageBackground,
	Image,
} from 'react-native'

import colors from '../../assets/colors'

import * as firebase from 'firebase/app'

import { Ionicons } from '@expo/vector-icons'

import { normalize } from '../../helpers/fontHelper'
import { connect } from 'react-redux'
 
class DriverOrderDetailScreen extends React.Component {
	constructor() {
		super()

		this.state = {
			items: [],
			user: {},
			totalWeight: '',
			totalPrice: '',
			destination: '',
		}
	}

	componentDidMount = () => {
		this.setState({
			items: this.props.route.params.order.item,
			user: this.props.route.params.order.user,
			totalWeight: this.props.route.params.order.totalWeight,
			totalPrice: this.props.route.params.order.totalPrice,
			paymentMethod: this.props.route.params.order.paymentMethod,
			destination: this.props.route.params.order.destination,
		})
	}

	acceptOrder = () => {
		let tempLocation = this.state.destination
		//console.log(selectedItem);
		this.props.orderIsPickedUp(true)
		this.props.updateOrderLocation(tempLocation)
		this.props.updateOrderHello(this.props.route.params.order)
		this.props.navigation.replace('Driver Map Screen')
	}

	renderOrderItem = (item, index) => {
		return (
			<View style={styles.itemListContainer}>
				<View style={styles.imageContainer}>
					{item.image ? (
						<Image
							source={{ uri: item.image }}
							style={styles.image}
							indicatorProps={{
								size: normalize(40),
								borderWidth: 0,
								color: colors.logoColor,
								unfilledColor: 'rgba(200,200,200,0.2)',
							}}
							imageStyle={{ borderRadius: 35 }}
						/>
					) : (
						<Image
							source={require('../../assets/recycle_icon.png')}
							style={styles.image}
						/>
					)}
				</View>

				<View
					style={{
						flex: 1,
						flexDirection: 'column',
						marginStart: normalize(30),
					}}>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ fontWeight: 'bold', color: 'silver' }}>Name: </Text>
						<Text>{item.key}</Text>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ fontWeight: 'bold', color: 'silver' }}>
							Weight:{' '}
						</Text>
						<Text>{item.weight} kg</Text>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ fontWeight: 'bold', color: 'silver' }}>Price: </Text>
						<Text>{item.price}$</Text>
					</View>
				</View>
			</View>
		)
	}

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				{/* ------header------ */}
				<View
					style={{
						flexDirection: 'row',
						flex: 0.08,
						paddingBottom: normalize(10),
						justifyContent: 'space-between',
					}}>
					<ImageBackground
						source={require('../../assets/header.png')}
						style={styles.imageBackground}
						resizeMode='stretch'>
						<TouchableOpacity
							onPress={() => {
								this.props.navigation.navigate('Pick Up Request')
							}}>
							<Ionicons name='ios-close' size={normalize(30)} color='white' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>DETAILS</Text>
					</ImageBackground>
					<View
						style={{ justifyContent: 'center', marginStart: normalize(20) }}>
						<Text
							style={{
								fontWeight: 'bold',
								color: colors.bgUserLogin,
								fontSize: normalize(18.5),
							}}>
							{this.state.detailKey}
						</Text>
					</View>
					<TouchableOpacity
					onPress = {this.acceptOrder}
						style={{ alignSelf: 'center', marginEnd: normalize(30) }}>
						<Text
							style={{
								fontSize: normalize(23),
								color: colors.bgUserLogin,
								fontWeight: 'bold',
							}}>
							Accept
						</Text>
					</TouchableOpacity>
				</View>
				{/* ------body content------ */}
				<Text style={styles.sectionTextTitle}>Requested Items: </Text>
				<View style={[styles.sectionContainer, { flex: 0.4 }]}>
					<FlatList
						data={this.state.items}
						renderItem={({ item, index }) => this.renderOrderItem(item, index)}
						keyExtractor={(item, index) => index.toString()}
						style={{ padding: normalize(10) }}
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
				<Text style={styles.sectionTextTitle}>Details: </Text>
				<View
					style={[
						styles.sectionContainer,
						{ flex: 0.3, justifyContent: 'center', padding: normalize(10) },
					]}>
					<View style={styles.sectionTextContainer}>
						<Text
							style={{
								fontSize: normalize(15),
								color: 'silver',
								marginStart: normalize(6),
							}}>
							Total Weight:{' '}
						</Text>
						<Text style={{ fontSize: normalize(15) }}>
							{this.state.totalWeight} kg
						</Text>
					</View>
					<View style={styles.sectionTextContainer}>
						<Text
							style={{
								fontSize: normalize(14),
								color: 'silver',
								marginStart: normalize(6),
							}}>
							Total Earning:{' '}
						</Text>
						<Text style={{ fontSize: normalize(15) }}>
							{this.state.totalPrice}$
						</Text>
					</View>
					<View style={styles.sectionTextContainer}>
						<Text
							style={{
								fontSize: normalize(15),
								color: 'silver',
								marginStart: normalize(6),
							}}>
							Payment Method:{' '}
						</Text>
						<Text style={{ fontSize: normalize(15) }}>
							{this.state.paymentMethod}
						</Text>
					</View>
					<View style={styles.sectionTextContainer}>
						<Text
							style={{
								fontSize: normalize(15),
								color: 'silver',
								marginStart: normalize(6),
							}}>
							Destination:{' '}
						</Text>
						<Text
							style={{ flex: 1, flexWrap: 'wrap', fontSize: normalize(15) }}>
							{this.state.destination}
						</Text>
					</View>
				</View>
				<Text style={styles.sectionTextTitle}>Customer: </Text>
				<View
					style={[
						styles.sectionContainer,
						{
							flex: 0.2,
							alignItems: 'center',
							padding: normalize(5),
							flexDirection: 'row',
							justifyContent: 'space-between',
							padding: normalize(5),
							paddingHorizontal: normalize(30),
						},
					]}>
					<TouchableOpacity>
						<View style={styles.sectionImageContainer}>
							{this.state.user.image ? (
								<Image
									source={{ uri: this.state.user.image }}
									style={styles.sectionImage}
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
								<Image
									source={require('../../assets/profile.png')}
									style={styles.image}
								/>
							)}
						</View>
					</TouchableOpacity>

					<View
						style={{
							flex: 1,
							flexDirection: 'column',
							marginStart: normalize(30),
						}}>
						<View
							style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold', color: 'silver' }}>
								Name:{' '}
							</Text>
							<Text>
								{this.state.user.first_name} {this.state.user.last_name}
							</Text>
						</View>
						<View
							style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold', color: 'silver' }}>
								Phone:{' '}
							</Text>
							<Text>{this.state.user.phone}</Text>
						</View>
						<View
							style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold', color: 'silver' }}>
								Email:{' '}
							</Text>
							<Text>{this.state.user.email}</Text>
						</View>
					</View>
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


export default connect(mapStateToProps, mapDispatchToProps)(DriverOrderDetailScreen)

const screenWidth = Dimensions.get('screen').width

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	imageBackground: {
		width: screenWidth * 0.35,
		justifyContent: 'space-evenly',
		alignItems: 'center',
		flexDirection: 'row',
	},
	headerTitle: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: normalize(20),
	},
	sectionContainer: {
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		backgroundColor: 'white',
		borderRadius: 5,
		marginHorizontal: normalize(20),
		marginVertical: normalize(5),
	},
	sectionTextTitle: {
		color: colors.bgUserLogin,
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
	sectionImageContainer: {
		height: normalize(100),
		width: normalize(100),
	},
	sectionImage: {
		flex: 1,
		height: null,
		width: null,
		borderRadius: normalize(50),
	},
})
