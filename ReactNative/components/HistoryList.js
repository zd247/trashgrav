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
				tempDataArray.push(child)
			} else if (child.driver == null && !this.props.isActive) {
				tempDataArray.push(child)
			}
      })
      
		this.setState({ data: tempDataArray })
	}

	renderData = (request, index) => (
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
					{request.destination.length > 36
						? request.destination.substring(0, 36 - 3) + '...'
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
			<View style = {{flex: 1, backgroundColor: 'white'}}>
				<FlatList
					data={this.state.data}
					renderItem={({ item, index }) =>
						this.renderData(item, index)
					}
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
		backgroundColor: '#fbfbf1',
		borderWidth: 0.15,
		borderRadius: normalize(10),
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
})
