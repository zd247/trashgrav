import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	ImageBackground,
	Image,
	SafeAreaView,
	TouchableOpacity,
	FlatList,
	Dimensions,
} from 'react-native'

import { normalize } from '../../../helpers/fontHelper'

import colors from '../../../assets/colors'
import { Ionicons } from '@expo/vector-icons'

class UserDetailScreen extends React.Component {
	constructor() {
		super()

		this.state = {
			detailKey: '',
			detailDestination: '',
			detailItems: [],
			detailPaymentMethod: '',
			detailTotalPrice: '',
			detailTotalWeight: '',
			detailDriver: {},
			detailUser: {},
		}
	}

	componentDidMount = () => {
		this.setState({
			detailKey: this.props.route.params.activity.key,
			detailItems: this.props.route.params.activity.item,
			detailTotalWeight: this.props.route.params.activity.totalWeight,
			detailTotalPrice: this.props.route.params.activity.totalPrice,
			detailPaymentMethod: this.props.route.params.activity.paymentMethod,
			detailDriver: this.props.route.params.activity.driver,
			detailUser: this.props.route.params.activity.user,
			detailDestination: this.props.route.params.activity.destination,
		})
	}

	componentWillUnmount = () => {
		console.log('[UserDetailScreen] component umounted')
	}

	navigateDriverDetail = () => {
		const user = this.state.detailDriver
		this.props.navigation.replace('UserSummaryScreen', { user })
	}

	renderItemList = (item, index) => {
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
							source={require('../../../assets/recycle_icon.png')}
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
					}}>
					<ImageBackground
						source={require('../../../assets/admin_header.png')}
						style={styles.imageBackground}
						resizeMode='stretch'>
						<TouchableOpacity
							onPress={() => {
								this.props.navigation.goBack()
							}}>
							<Ionicons
								name='ios-arrow-back'
								size={normalize(30)}
								color='white'
							/>
						</TouchableOpacity>
						<Text style={styles.headerTitle}>DETAILS</Text>
					</ImageBackground>
					<View
						style={{ justifyContent: 'center', marginStart: normalize(20) }}>
						<Text
							style={{
								fontWeight: 'bold',
								color: colors.bgAdminLogin,
								fontSize: normalize(18.5),
							}}>
							{this.state.detailKey}
						</Text>
					</View>
				</View>
				{/* ------body content------ */}
				<Text style={styles.sectionTextTitle}>Requested Items: </Text>
				<View style={[styles.sectionContainer, { flex: 0.3 }]}>
					<FlatList
						data={this.state.detailItems}
						renderItem={({ item, index }) => this.renderItemList(item, index)}
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
							{this.state.detailTotalWeight} kg
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
							{this.state.detailTotalPrice}$
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
							{this.state.detailPaymentMethod}
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
							{this.state.detailDestination}
						</Text>
					</View>
				</View>
				<Text style={styles.sectionTextTitle}>Driver: </Text>
				<View
					style={[
						styles.sectionContainer,
						{
							flex: 0.3,
							alignItems: 'center',
							padding: normalize(5),
							flexDirection: 'row',
							justifyContent: 'space-between',
							padding: normalize(5),
							paddingHorizontal: normalize(30),
						},
					]}>
					<View style={{ flexDirection: 'column', alignItems: 'center' }}>
						<Text
							style={{
								marginBottom: normalize(5),
								fontWeight: 'bold',
								color: 'silver',
							}}>
							Customer
						</Text>
						<View style={styles.sectionImageContainer}>
							{this.state.detailUser.image ? (
								<Image
									source={{ uri: this.state.detailUser.image }}
									style={styles.sectionImage}
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
									source={require('../../../assets/profile.png')}
									style={styles.sectionImage}
								/>
							)}
						</View>
						<Text
							style={{
								marginTop: normalize(5),
								fontWeight: 'bold',
							}}>
							{this.state.detailUser.first_name}{' '}
							{this.state.detailUser.last_name}
						</Text>
					</View>
					<View style={{ flexDirection: 'column', alignItems: 'center' }}>
						<Ionicons
							name='ios-paper-plane'
							size={normalize(30)}
							color='green'
						/>
						<Text>Sent to..</Text>
					</View>
					{this.state.detailDriver ? (
						<View style={{ flexDirection: 'column', alignItems: 'center' }}>
							<Text
								style={{
									marginBottom: normalize(5),
									fontWeight: 'bold',
									color: 'silver',
								}}>
								Driver
							</Text>
							<TouchableOpacity onPress={this.navigateDriverDetail}>
								<View style={styles.sectionImageContainer}>
									{this.state.detailDriver.image ? (
										<Image
											source={{ uri: this.state.detailDriver.image }}
											style={styles.sectionImage}
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
											source={require('../../../assets/profile.png')}
											style={styles.sectionImage}
										/>
									)}
								</View>
							</TouchableOpacity>
							<Text
								style={{
									marginTop: normalize(5),
									fontWeight: 'bold',
								}}>
								{this.state.detailDriver.first_name}{' '}
								{this.state.detailDriver.last_name}
							</Text>
						</View>
					) : (
						<Ionicons name='ios-close' size={normalize(150)} color='red' />
					)}
				</View>

				<SafeAreaView />
			</View>
		)
	}
}

export default UserDetailScreen

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
