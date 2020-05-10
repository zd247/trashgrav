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
} from 'react-native'

import { normalize } from '../../../helpers/fontHelper'

import colors from '../../../assets/colors'
import { Ionicons } from '@expo/vector-icons'
import { Rating } from 'react-native-ratings'

import { snapshotToArray } from '../../../helpers/firebaseHelpers'

import * as firebase from 'firebase/app'

class UserSummaryScreen extends React.Component {
	constructor() {
		super()

		this.state = {
			userImage: '',
			userFirstName: '',
			userLastName: '',
			userPhone: '',
			userEmail: '',
			userKey: '',
			userRating: '',
			userPassword: '',
			activities: [],
			isFetching: false,
		}
	}

	componentDidMount = () => {
		this.loadUserData()
		this.loadActivityData()
	}

	componentWillUnmount = () => {
		console.log('[UserSummaryScreen] components unmounted')
		firebase.database().ref('History').off()
	}

	loadUserData = () => {
		this.setState({
			userImage: this.props.route.params.user.image,
			userFirstName: this.props.route.params.user.first_name,
			userLastName: this.props.route.params.user.last_name,
			userPhone: this.props.route.params.user.phone,
			userEmail: this.props.route.params.user.email,
			userKey: this.props.route.params.user.uid,
			userRating: this.props.route.params.user.rating,
			userPassword: this.props.route.params.user.password,
		})
	}

	loadActivityData = async () => {
		const activityList = await firebase
			.database()
			.ref('History')
			.child(this.props.route.params.user.uid)
			.once('value') // retrieve data from server
		const activityListArray = snapshotToArray(activityList) // arrayed the data
		this.setState({
			activities: activityListArray,
			isFetching: false,
		})
	}

	onRefreshActivityData = () => {
		this.setState({ isFetching: true })
		this.loadActivityData()
	}

	renderActivityData = (activity, index) => {
		return (
			<TouchableOpacity
				style={styles.listContainer}
				onPress={() => {
					this.props.navigation.navigate('UserDetailScreen', { activity })
				}}>
				<Text
					style={{
						color: colors.bgAdminLogin,
						alignSelf: 'center',
						fontWeight: 'bold',
					}}>
					{activity.key}
				</Text>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
					<Text style={{ fontWeight: 'bold', color: 'silver' }}>
						Destination:{' '}
					</Text>
					<Text>
						{activity.destination.length > 20
							? activity.destination.substring(0, 20 - 3) + '...'
							: activity.destination}
					</Text>
				</View>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
					<Text style={{ fontWeight: 'bold', color: 'silver' }}>
						Total price:{' '}
					</Text>
					<Text>{activity.totalPrice}$</Text>
				</View>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
					<Text style={{ fontWeight: 'bold', color: 'silver' }}>
						Total weight:{' '}
					</Text>
					<Text>{activity.totalWeight} kg</Text>
				</View>
				<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
					<Text style={{ fontWeight: 'bold', color: 'silver' }}>
						Payment method:{' '}
					</Text>
					<Text>{activity.paymentMethod}</Text>
				</View>
			</TouchableOpacity>
		)
	}

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				{/* -------------top bar------------ */}
				<View style={styles.topHeader}>
					<TouchableOpacity
						style={{ flex: 1 }}
						onPress={() => {
							this.props.navigation.goBack()
						}}>
						<Ionicons
							name='ios-arrow-back'
							size={normalize(30)}
							color='white'
							style={{ marginLeft: normalize(20) }}
						/>
					</TouchableOpacity>
					<Text style={styles.topHeaderTitle}>
						{this.state.userFirstName} {this.state.userLastName}'s Activities
					</Text>
				</View>
				{/* -------------header------------ */}
				<View style={styles.header}>
					<ImageBackground
						source={require('../../../assets/admin_user_header_detail.png')}
						style={{
							flex: 1,
							justifyContent: 'center',
							flexDirection: 'row',
							alignItems: 'center',
							padding: normalize(15),
						}}
						resizeMode={'stretch'}>
						<View style={styles.imageContainer}>
							{this.state.userImage ? (
								<Image
									source={{ uri: this.state.userImage }}
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
									source={require('../../../assets/profile.png')}
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
							<View
								style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>Phone: </Text>
								<Text style={{ color: 'silver' }}>{this.state.userPhone}</Text>
							</View>
							<View
								style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>Email: </Text>
								<Text style={{ color: 'silver' }}>{this.state.userEmail}</Text>
							</View>
							<View
								style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>Password: </Text>
								<Text style={{ color: 'silver' }}>
									{this.state.userPassword}
								</Text>
							</View>
							<View
								style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>Ratings: </Text>
								{this.state.userRating ? (
									<Rating
										type='star'
										imageSize={20}
										readonly={true}
                              showRating={false}
                              startingValue={parseFloat(this.state.userRating.average)}
									/>
								) : (
									<Rating
										type='star'
										imageSize={20}
										readonly={true}
                              showRating={false}
                              startingValue= {1}
									/>
								)}
							</View>
						</View>
					</ImageBackground>
				</View>
				{/* -------------activity list------------ */}
				<View style={{ flex: 0.7 }}>
					<Text
						style={{
							fontSize: normalize(20),
							fontWeight: 'bold',
							marginVertical: normalize(10),
							alignSelf: 'center',
							color: colors.bgAdminLogin,
						}}>
						REQUEST LIST
					</Text>
					<FlatList
						data={this.state.activities}
						renderItem={({ item, index }) =>
							this.renderActivityData(item, index)
						}
						keyExtractor={(item, index) => index.toString()}
						onRefresh={() => this.onRefreshActivityData()}
						refreshing={this.state.isFetching}
						ListEmptyComponent={
							<View style={{ marginTop: normalize(50), alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>
									No Activity Currently Exist In This User
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

export default UserSummaryScreen

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	topHeader: {
		height: normalize(50),
		borderBottomWidth: 0.5,
		backgroundColor: colors.bgAdminLogin,
		borderBottomColor: 'silver',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
	},
	topHeaderTitle: {
		fontSize: normalize(24),
		color: 'white',
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
	},
	header: {
		flex: 0.3,
	},
	imageContainer: {
		height: normalize(100),
		width: normalize(100),
		marginLeft: normalize(10),
	},
	image: {
		flex: 1,
		height: null,
		width: null,
		borderRadius: normalize(50),
	},

	listContainer: {
		flex: 1,
		minHeight: normalize(100),
		flexDirection: 'row',
		backgroundColor: '#fbfbf1',
		borderWidth: 0.15,
		borderRadius: normalize(10),
		padding: normalize(20),
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		marginVertical: normalize(10),
		marginHorizontal: normalize(50),
		flexDirection: 'column',
	},
})
