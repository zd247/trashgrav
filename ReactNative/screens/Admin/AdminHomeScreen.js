import React, { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ImageBackground,
	Dimensions,
} from 'react-native'
import ScrollableTabView, {
	DefaultTabBar,
} from 'react-native-scrollable-tab-view'

import colors from '../../assets/colors'

import Items from './NavTabs/Items'
import Requests from './NavTabs/Requests'
import Activities from './NavTabs/Activities'

const screenWidth = Dimensions.get('screen').width

const AdminHomeScreen = props => {
	return (
		<View style={styles.container}>
			<SafeAreaView />
			<View style={styles.header}>
				<ImageBackground
					source={require('../../assets/admin_header_bg.png')}
					style={styles.imageBackground}
					resizeMode='contain'>
					<Text style={styles.title}>ADMIN</Text>
				</ImageBackground>
			</View>
			<View style={styles.tabbar}>
				<ScrollableTabView
					initialPage={0}
					tabBarActiveTextColor={colors.bgAdminLogin}
					renderTabBar={() => (
						<DefaultTabBar
							underlineStyle={{
								backgroundColor: colors.bgAdminLogin,
							}}
						/>
					)}>
					<Items tabLabel='Items' props={props} />
					<Requests tabLabel='Requests' props={props} />
					<Activities tabLabel='Activities' props={props} />
				</ScrollableTabView>
			</View>
			<SafeAreaView />
		</View>
	)
}

export default AdminHomeScreen

const styles = StyleSheet.create({
	container: {
    flex:1,
    backgroundColor:'white'
  },
  header: {
    position:'absolute'
  },
  tabbar: {
    flex:1,
    marginTop: screenWidth*0.3,
    paddingHorizontal:30
  },
  imageBackground: {
    width: screenWidth*0.4,
    height: screenWidth*0.4,
    alignItems:'center'
  },
  title: {
    color:'white',
    marginTop:25,
    fontWeight:'bold',
    fontSize:20
  }
})
