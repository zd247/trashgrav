import React from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	SafeAreaView,
	FlatList,
	Image,
} from 'react-native'

import { normalize } from '../../../helpers/fontHelper'
import { snapshotToArray } from '../../../helpers/firebaseHelpers'
import colors from '../../../assets/colors'

import { Ionicons } from '@expo/vector-icons'

import * as firebase from 'firebase/app'

class Users extends React.Component {
	constructor() {
		super()
		this.state = {
			data: [],
			data_temp: [],
			isFetching: false,
		}
	}

	componentDidMount = () => {
		this.loadDataFromServer()
	}

	componentWillUnmount = () => {
		console.log('[Users] components unmounted')
		firebase.database().ref('Users').off()
	}

	loadDataFromServer = async () => {
		const usersList = await firebase.database().ref('Users').once('value') // retrieve data from server
		const usersListArray = snapshotToArray(usersList) // arrayed the data
		this.setState({
			data: usersListArray,
			data_temp: usersListArray,
			isFetching: false,
		})
	}

	onRefreshData = () => {
		this.setState({ isFetching: true })
		this.loadDataFromServer()
	}

	searchData = text => {
		let data = []
		this.state.data_temp.map(function (value) {
			if (value.first_name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
				data.push(value)
			}
			if (value.last_name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
				data.push(value)
			}
		})
		this.setState({
			data: data,
			search: text,
		})
	}

	renderData = (user, index) => {
		return (
			<TouchableOpacity
				style={styles.UsersListContainer}
				onPress={() => {
					this.props.props.navigation.navigate('UserSummaryScreen', { user })
				}}>
				<View style={styles.imageContainer}>
					{user.image ? (
						<Image
							source={{ uri: user.image }}
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
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ fontWeight: 'bold', color: 'silver' }}>Name: </Text>
						<Text>
							{user.first_name} {user.last_name}
						</Text>
					</View>
					<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
						<Text style={{ fontWeight: 'bold', color: 'silver' }}>Phone: </Text>
						<Text>{user.phone}</Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView />
				{/* --------------search bar-------------- */}
				<View style={{ flexDirection: 'row', paddingStart: normalize(10) }}>
					<View style={styles.section}>
						<TextInput
							placeholder='Search..'
							style={{ flex: 1, marginLeft: 10 }}
							value={this.state.search}
							autoCapitalize='none'
							onChangeText={text => this.searchData(text)}
						/>
						<TouchableOpacity
							onPress={() => this.searchData('')}
							style={{ paddingHorizontal: 10 }}>
							<Ionicons name='ios-close' color='gray' size={normalize(20)} />
						</TouchableOpacity>
					</View>
				</View>
				{/* ---------------user_list--------------- */}
				<FlatList
					data={this.state.data}
					renderItem={({ item, index }) => this.renderData(item, index)}
					keyExtractor={(item, index) => index.toString()}
					onRefresh={() => this.onRefreshData()}
					refreshing={this.state.isFetching}
					ListEmptyComponent={
						<View style={{ marginTop: normalize(50), alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold' }}>
								No User Currently Exist In this List
							</Text>
						</View>
					}
				/>
				<SafeAreaView />
			</View>
		)
	}
}

export default Users

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},

	UsersListContainer: {
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
		marginHorizontal: normalize(30),
	},
	section: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '95%',
		paddingVertical: normalize(5),
		paddingHorizontal: normalize(10),
		borderRadius: 10,
		backgroundColor: '#f2f2f2',
		margin: normalize(10),
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
