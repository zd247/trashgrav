import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
   FlatList,
   TextInput,
} from 'react-native'

import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import colors from '../../../assets/colors'

import { connect } from 'react-redux'
import ListItem from '../../../components/ItemList'

import { snapshotToArray } from '../../../helpers/firebaseHelpers'
import * as firebase from 'firebase/app'
import 'firebase/storage'

class Items extends React.Component {
	constructor() {
		super()

		this.state = {
         data: [],
         data_temp: [],
         search: ''
		}
	}

	componentDidMount = async () => {
		const recycleItems = await firebase.database().ref('Items').once('value') // retrieve data from server
		const recycleItemsArray = snapshotToArray(recycleItems) // arrayed the data
      this.props.loadRecycleItem(recycleItemsArray) // store into redux
      this.setState({data_temp: recycleItemsArray})
      this.setState({data: recycleItemsArray})
	}

	_renderData = (item, index) => (
		<ListItem item={item}>
			<TouchableOpacity style={styles.button}>
				<AntDesign name='arrowright' color='white' size={15} />
			</TouchableOpacity>
		</ListItem>
   )

   _search(text){
      let data = [];
      this.state.data_temp.map(function(value){
        if(value.key.indexOf(text.toLowerCase()) > -1){
          data.push(value);
        }
      });
      this.setState({
        data:data,
        search:text
      });
  }

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.section}>
					<TextInput
						placeholder='Search..'
						style={{ flex: 1, marginLeft: 10 }}
						value={this.state.search}
						onChangeText={text => this._search(text)}
					/>
					<TouchableOpacity
						onPress={() => this._search('')}
						style={{ paddingHorizontal: 10 }}>
						<Ionicons name='ios-close' color='gray' size={20} />
					</TouchableOpacity>
				</View>
				<FlatList
					data={this.state.data}
					renderItem={({ item, index }) =>
						this._renderData(item, index)
					}
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
		)
	}
}

const mapStateToProps = state => {
	return {
		recycleItemList: state.recycleItemList,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		loadRecycleItem: recycleItemList =>
			dispatch({
				type: 'LOAD_RECYCLE_ITEMS_FROM_SERVER',
				payload: recycleItemList,
			}),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Items)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	button: {
		width: 30,
		height: 30,
		backgroundColor: colors.bgAdminLogin,
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
   },
   section: {
      flexDirection:'row',
      alignItems:'center',
      paddingVertical:5,
      paddingHorizontal:10,
      borderRadius:10,
      backgroundColor:'#f2f2f2',
      marginVertical: 10
    },
})
