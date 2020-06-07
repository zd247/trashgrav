import React from 'react'
import {
	StyleSheet,
	Text,
	View,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
} from 'react-native'

import ScrollableTabView, {
	DefaultTabBar,
} from 'react-native-scrollable-tab-view'

import { Ionicons } from '@expo/vector-icons'
import colors from '../../assets/colors'
import { normalize } from '../../helpers/fontHelper'

import Active from './ActiveHistory'
import Inactive from './InactiveHistory'

class HistoryScreen extends React.Component {
	render() {
		return (
			<View style={{ flex: 1 }}>
				<View>
					<ImageBackground
						source={require('../../assets/header.png')}
						style={styles.imageBackground}
						resizeMode='stretch'>
						<TouchableOpacity
							onPress={() => this.props.navigation.openDrawer()}>
							<Ionicons name='ios-menu' size={normalize(30)} color='white' />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>HISTORY</Text>
					</ImageBackground>
				</View>
				{/* ------------------------- */}
				<View style={styles.tabbar}>
					<ScrollableTabView
						initialPage={0}
						tabBarActiveTextColor={colors.bgUserLogin}
						renderTabBar={() => (
							<DefaultTabBar
								underlineStyle={{
									backgroundColor: colors.bgUserLogin,
								}}
							/>
						)}>
						<Active tabLabel='Active' props={this.props} />
						<Inactive tabLabel='Inactive' props={this.props} />
					</ScrollableTabView>
				</View>
			</View>
		)
	}
}

export default HistoryScreen

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
	tabbar: {
		flex: 1,
		marginTop: screenHeight * 0.05,
	},
})
