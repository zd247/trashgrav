import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	TouchableOpacity,
} from 'react-native'

import { normalize } from '../helpers/fontHelper'
import { Ionicons } from '@expo/vector-icons'
import colors from '../assets/colors'

import { userCache } from '../helpers/cacheHelper'

import { snapshotToArray } from '../helpers/firebaseHelpers'
import * as firebase from 'firebase/app'
import 'firebase/storage'

class HistoryList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			data: [],
		}
	}

	componentDidMount = () => {
		this.loadDataFromServer()
	}

	loadDataFromServer = async () => {
		const userData = await userCache.get('data')
		const requests = await firebase
			.database()
			.ref('History')
			.child(userData.uid)
			.once('value') // retrieve data from server
		const requestsArray = snapshotToArray(requests)

		let tempDataArray = []
		requestsArray.forEach(child => {
			if (child.driver != null && this.props.isActive) {
				child.isActive = true
				tempDataArray.push(child)
			} else if (child.driver == null && !this.props.isActive) {
				child.isActive = false
				tempDataArray.push(child)
			}
		})

		this.setState({ data: tempDataArray })
   }
   
	renderData = (request, index) => (
		<View style={styles.listContainer}>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<Text
					style={{
						color: colors.bgUserLogin,
						alignSelf: 'center',
						fontWeight: 'bold',
					}}>
					ID:{' '}
				</Text>
				<Text
					style={{
						color: colors.bgUserLogin,
						alignSelf: 'center',
						fontWeight: 'bold',
					}}>
					{request.key}
				</Text>
			</View>

			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<Text style={{ fontWeight: 'bold', color: 'silver' }}>
					Pick up location :{' '}
				</Text>
				<Text>
					{request.destination.length > 30
						? request.destination.substring(0, 30 - 3) + '...'
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

			{request.isActive ? (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						alignItems: 'center',
						borderTopWidth: 0.5,
						borderColor: colors.bgUserLogin,
						marginTop: normalize(20),
					}}>
					<TouchableOpacity style={styles.itemButton}>
						<Ionicons
							name='ios-call'
							size={normalize(30)}
							color={colors.bgUserLogin}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.itemButton}
						onPress={() => {
                     this.props.navigation.navigate('ChatScreen', {request})
                  }}>
						<Ionicons
							name='ios-chatbubbles'
							size={normalize(30)}
							color={colors.bgUserLogin}
						/>
					</TouchableOpacity>
					<TouchableOpacity style={styles.itemButton}>
						<Ionicons
							name='ios-alert'
							size={normalize(30)}
							color={colors.bgUserLogin}
						/>
					</TouchableOpacity>
				</View>
			) : (
				<View
					style={{
						flex: 1,
						flexDirection: 'row',
						alignItems: 'center',
						borderTopWidth: 0.5,
						borderColor: colors.bgUserLogin,
						marginTop: normalize(20),
					}}>
					<View style={styles.itemButton}>
						<Ionicons name='ios-call' size={normalize(30)} color='silver' />
					</View>
					<View style={styles.itemButton}>
						<Ionicons
							name='ios-chatbubbles'
							size={normalize(30)}
							color='silver'
						/>
					</View>
					<TouchableOpacity style={styles.itemButton}>
						<Ionicons
							name='ios-alert'
							size={normalize(30)}
							color={colors.bgUserLogin}
						/>
					</TouchableOpacity>
				</View>
			)}
		</View>
   )

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<FlatList
					data={this.state.data}
					renderItem={({ item, index }) => this.renderData(item, index)}
					ListEmptyComponent={
						<View style={{ marginTop: normalize(50), alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold' }}>
								No Request Currently Exist In This User
							</Text>
						</View>
					}
				/>
			</View>
		)
	}
}
export default HistoryList

const styles = StyleSheet.create({
	listContainer: {
		flex: 1,
		minHeight: normalize(100),
		flexDirection: 'row',
		backgroundColor: 'white',
		borderWidth: 0.3,
		borderColor: colors.bgUserLogin,
		borderRadius: normalize(5),
		padding: normalize(20),
		shadowColor: 'black',
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 6,
		shadowOpacity: 0.26,
		elevation: 5,
		marginVertical: normalize(5),
		marginHorizontal: normalize(10),
		flexDirection: 'column',
	},
	itemButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: normalize(15),
		marginTop: normalize(20),
	},
})
