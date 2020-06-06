import React, { Component } from 'react'
import { StyleSheet } from 'react-native'

import StartScreen from './screens/StartScreen'
import ItemScreen from './screens/ItemScreen'

import LoginScreen from './screens/LoginScreen'
import SignUpScreen from './screens/SignUpScreen'
import HomeScreen from './screens/HomeScreen'
import UserProfileScreen from './screens/UserProfileScreen'
import NotificationScreen from './screens/NotificationScreen'

import AdminLoginScreen from './screens/Admin/AdminLoginScreen'
import AdminHomeScreen from './screens/Admin/AdminHomeScreen'
import UserSummaryScreen from './screens/Admin/NavTabs/UserSummaryScreen'
import UserDetailScreen from './screens/Admin/NavTabs/UserDetailScreen'

import CustomerMapScreen from './screens/Customer/CustomerMapScreen'
import SettingScreen from './screens/SettingScreen'
import LoadingScreen from './screens/LoadingScreen'

import DriverHomeScreen from './screens/Driver/DriverHomeScreen'
import DriverMapScreen from './screens/Driver/DriverMapScreen'
import DriverOrderDetailScreen from './screens/Driver/DriverOrderDetailScreen'

import CustomDrawerNavigator from './screens/DrawerNavigator/CustomDrawerNavigator'
import CartContainer from './redux/containers/CartContainer'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator, HeaderTitle } from '@react-navigation/stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'

import colors from './assets/colors'
import { Ionicons } from '@expo/vector-icons'

import { connect } from 'react-redux'

import {userCache} from './helpers/cacheHelper'

import * as firebase from 'firebase/app'

const Stack = createStackNavigator()
const Drawer = createDrawerNavigator()
const Tab = createBottomTabNavigator()

class TrashGrav extends Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	componentDidMount= () => {
		this.checkIfLoggedIn()
	}

	checkIfLoggedIn = async () => {
		let user = await userCache.get('data')
		
		if (user) {
			await this.props.signIn(user)
		}else {
			console.log('No user Sign In')
			this.props.signOut()
		}
		
	}

	render() {
		{
			/*if (this.props.auth.isLoading) {
      return <LoadingScreen />;
    } */
		}
		return (
			<NavigationContainer>
				{!this.props.auth.isSignedIn ? (
					<Stack.Navigator
						screenOptions={{
							headerStyle: {
								backgroundColor: colors.bgMain,
							},
							headerTintColor: 'white',
						}}>
						<Stack.Screen
							name='StartScreen'
							component={StartScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name='LoginScreen'
							component={LoginScreen}
							options={{
								headerBackTitleVisible: false,
								headerTransparent: true,
								headerTitle: '',
							}}
						/>
						<Stack.Screen
							name='SignUpScreen'
							component={SignUpScreen}
							options={{
								headerBackTitleVisible: false,
								headerTransparent: true,
								headerTitle: '',
							}}
						/>
						<Stack.Screen
							name='AdminLoginScreen'
							component={AdminLoginScreen}
							options={{
								headerBackTitleVisible: false,
								headerTransparent: true,
								headerTitle: '',
							}}
						/>
					</Stack.Navigator>
				) : this.props.auth.isAdmin ? (
					<Stack.Navigator>
						<Stack.Screen
							name='AdminHomeScreen'
							component={AdminHomeScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name='ItemScreen'
							component={ItemScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name='UserSummaryScreen'
							component={UserSummaryScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name='UserDetailScreen'
							component={UserDetailScreen}
							options={{ headerShown: false }}
						/>
					</Stack.Navigator>
				) : !this.props.auth.isDriver ? (
					<CustomerDrawerNavigator />
				) : (
					<DriverDrawerNavigator />
				)}
			</NavigationContainer>
		)
	}
}

const CustomerStackNavigator = ({ navigation }) => (
	<Stack.Navigator>
		<Stack.Screen
			options={{ headerShown: false }}
			name='Recycle Item List'
			component={HomeScreen}
		/>
		<Stack.Screen
			options={{ title: 'Customer Map Screen' }}
			name='CustomerMapScreen'
			component={CustomerMapScreen}
		/>
		<Stack.Screen
			name='ItemScreen'
			component={ItemScreen}
			options={{ headerShown: false }}
		/>
	</Stack.Navigator>
)

const CustomerDrawerNavigator = () => (
	<ActionSheetProvider>
		<Drawer.Navigator
			drawerContent={props => <CustomDrawerNavigator {...props} />}>
			<Drawer.Screen
				options={{ drawerIcon: () => <Ionicons name='ios-home' size={24} /> }}
				name='Home'
				component={CustomerStackNavigator}
			/>
			<Drawer.Screen
				options={{
					drawerIcon: () => <Ionicons name='ios-chatbubbles' size={24} />,
					headerBackTitleVisible: false,
					headerTransparent: true,
					headerTitle: '',
				}}
				name='Notification'
				component={NotificationScreen}
			/>
			<Drawer.Screen
				options={{ drawerIcon: () => <Ionicons name='ios-person' size={24} /> }}
				name='User Profile'
				component={UserProfileScreen}
			/>
			<Drawer.Screen
				options={{
					drawerIcon: () => <Ionicons name='ios-settings' size={24} />,
					headerBackTitleVisible: false,
					headerTransparent: true,
					headerTitle: '',
				}}
				name='Setting'
				component={SettingScreen}
			/>
			
		</Drawer.Navigator>
	</ActionSheetProvider>
)

const DriverStackNavigator = ({ navigation }) => (
	<Stack.Navigator>
		<Stack.Screen
			options={{ headerShown: false }}
			name='Pick Up Request'
			component={DriverHomeScreen}
		/>
		<Stack.Screen
		options={{ headerShown: false }}
			name='Driver Order Detail Screen'
			component={DriverOrderDetailScreen}
		/>

		<Stack.Screen
			options={{ title: 'Driver Map Screen' }}
			name='Driver Map Screen'
			component={DriverMapScreen}
		/>
	</Stack.Navigator>
)

const DriverTabNavigator = ({ route }) => (
	<Tab.Navigator
		tabBarOptions={{
			style: {
				backgroundColor: colors.bgMain,
			},
			activeTintColor: colors.logoColor,
			inactiveTintColor: colors.bgTextInput,
		}}>
		<Tab.Screen name='Pick Up Request' component={DriverHomeScreen} />
		<Tab.Screen name='Driver Map Screen' component={DriverMapScreen} />
	</Tab.Navigator>
)

const DriverDrawerNavigator = () => (
	<ActionSheetProvider>
		<Drawer.Navigator
			drawerContent={props => <CustomDrawerNavigator {...props} />}>
			<Drawer.Screen
				options={{
					drawerIcon: () => <Ionicons name='ios-bicycle' size={24} />,
				}}
				name='Home'
				component={DriverStackNavigator}
			/>
			<Drawer.Screen
				options={{ drawerIcon: () => <Ionicons name='ios-person' size={24} /> }}
				name='User Profile'
				component={UserProfileScreen}
			/>
			<Drawer.Screen
				options={{
					drawerIcon: () => <Ionicons name='ios-settings' size={24} />,
				}}
				name='Setting'
				component={SettingScreen}
			/>
		</Drawer.Navigator>
	</ActionSheetProvider>
)

const mapStateToProps = state => {
	return {
		auth: state.auth,
		recycleItemList: state.recycleItemList,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		signIn: user => dispatch({ type: 'SIGN_IN', payload: user }),
		signOut: () => dispatch({ type: 'SIGN_OUT' }),
		changeAdminMode: () => dispatch({ type: 'CHANGE_TO_ADMIN_MODE' }),
		changeBackFromAdminMode: () =>
			dispatch({ type: 'CHANGE_BACK_FROM_ADMIN_MODE' }),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TrashGrav)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},

	header: {
		height: 70,
		borderBottomWidth: 0.5,
		borderBottomColor: colors.borderColor,
		alignItems: 'center',
		justifyContent: 'center',
	},
})

//git push --set-upstream origin master
