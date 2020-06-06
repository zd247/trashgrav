import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
	FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import colors from '../assets/colors'
import { normalize } from '../helpers/fontHelper'

import * as firebase from 'firebase/app'
import { snapshotToArray } from '../helpers/firebaseHelpers'
import { connect } from 'react-redux'

class NotificationScreen extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			activeRequests: [],
			requests: [],
		}
	}

	componentDidMount = () => {
		this.loadInitialRequest()
	}

	loadInitialRequest = async () => {
		const requests = await firebase.database().ref('Requests').once('value')
		const requestsArray = snapshotToArray(requests)

		let tempActiveArray = []
		let tempArray = []
		requestsArray.forEach(child => {
			if (child.driver == null) {
				tempActiveArray.push(child)
			} else {
				tempArray.push(child)
			}
		})
		

		this.setState({ activeRequests: tempActiveArray })
      this.setState({ requests: tempArray })
      
      console.log(this.state.requests[0].key)
	}

	renderActiveRequestList = (request, index) => (
		<TouchableOpacity style={styles.listContainer} onPress={() => {}}>
			<Text
				style={{
					color: colors.bgUserLogin,
					alignSelf: 'center',
					fontWeight: 'bold',
				}}>
				{request.key}
			</Text>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{ fontWeight: 'bold', color: 'silver' }}>
					Destination:{' '}
				</Text>
				<Text>
					{request.destination.length > 20
						? request.destination.substring(0, 20 - 3) + '...'
						: request.destination}
				</Text>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{ fontWeight: 'bold', color: 'silver' }}>
					Total price:{' '}
				</Text>
				<Text>{request.totalPrice}$</Text>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{ fontWeight: 'bold', color: 'silver' }}>
					Total weight:{' '}
				</Text>
				<Text>{request.totalWeight} kg</Text>
			</View>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{ fontWeight: 'bold', color: 'silver' }}>
					Payment method:{' '}
				</Text>
				<Text>{request.paymentMethod}</Text>
			</View>
		</TouchableOpacity>
	)

	render() {
		return (
			<View style={{ flex: 1 }}>
				<View>
					<ImageBackground
						source={require('../assets/header.png')}
						style={styles.imageBackground}
						resizeMode='stretch'>
						<TouchableOpacity
							onPress={() => this.props.navigation.openDrawer()}>
							<Ionicons name='ios-menu' size={normalize(30)} color='white' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>NOTIFICATIONS</Text>
					</ImageBackground>
				</View>
				{/* ------------------------- */}
				<View style={{ flex: 1 }}>
					<View style={{ flex: 0.5, borderWidth: 2 }}>
               <FlatList
						data={this.state.activeRequests}
						renderItem={({ item, index }) =>
							this.renderActiveRequestList(item, index)
						}
						ListEmptyComponent={
							<View style={{ marginTop: normalize(50), alignItems: 'center' }}>
								<Text style={{ fontWeight: 'bold' }}>
									No Active Request Currently Exist In This User
								</Text>
							</View>
						}
					/>
					</View>
					<View style={{ flex: 0.5, borderWidth: 2 }}></View>
				</View>
			</View>
		)
	}
}

const mapStateToProps = state => {
	return {
		currentUser: state.auth.currentUser,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		loadUser: user =>
			dispatch({
				type: 'LOAD_USER_FROM_SERVER',
				payload: user,
			}),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationScreen)

const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height

const styles = StyleSheet.create({
	imageBackground: {
		width: screenWidth * 0.45,
		height: normalize(43),
		justifyContent: 'space-evenly',
		alignItems: 'center',
		flexDirection: 'row',
	},
	headerTitle: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: normalize(17),
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
