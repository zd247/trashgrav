import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";

import TrashGrav from "./TrashGrav";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import AdminHomeScreen from "./screens/Admin/AdminHomeScreen";
import CustomerCart from "./screens/Customer/CustomerCart";
import SettingScreen from "./screens/SettingScreen";
import SecurityCheck from "./screens/AppSwitchNavigator/SecurityCheck";
import LoadingScreen from "./screens/LoadingScreen";

import CustomDrawerNavigator from "./screens/DrawerNavigator/CustomDrawerNavigator";
import CartContainer from "./redux/containers/CartContainer";

import {
  createAppContainer,
  createSwitchNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator,
} from "react-navigation";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import colors from "./assets/colors";
import { Ionicons } from "@expo/vector-icons";

import { Provider } from "react-redux";
import store from "./redux/store";

import * as firebase from "firebase/app";
import { firebaseConfig } from "./config/config";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.initializeFirebase();
  }
  initializeFirebase = () => {
    if (!firebase.apps.length){
      firebase.initializeApp(firebaseConfig);
    }
    
  };

  render() {
    return (
      <Provider store={store}>
        <TrashGrav />
      </Provider>
    );
  }
}

const LoginStackNavigator = createStackNavigator(
  {
    LoginScreen: {
      screen: LoginScreen,
      navigationOptions: {
        header: null,
      },
    },
    SignUpScreen: {
      screen: SignUpScreen,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    mode: "modal",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: colors.bgMain,
      },
    },
  }
);

const HomeTabNavigator = createBottomTabNavigator(
  {
    HomeScreen: {
      screen: HomeScreen,
      navigationOptions: {
        tabBarLabel: "Recycle Item List",
        tabBarIcon: ({ tintColor }) => (
          <CartContainer color={tintColor} type="recycleItemList" />
        ),
      },
    },
    CustomerCartScreen: {
      screen: CustomerCart,
      navigationOptions: {
        tabBarLabel: "Customer Cart",
        tabBarIcon: ({ tintColor }) => (
          <CartContainer color={tintColor} type="recycleCart" />
        ),
      },
    },
  },
  {
    tabBarOptions: {
      style: {
        backgroundColor: colors.bgMain,
      },
      activeTintColor: colors.logoColor,
      inactiveTintColor: colors.bgTextInput,
    },
  }
);

HomeTabNavigator.navigationOptions = ({ navigation }) => {
  const { routeName } = navigation.state.routes[navigation.state.index];

  switch (routeName) {
    case "HomeScreen":
      return {
        headerTitle: "Home Screen",
      };
    case "CustomerCartScreen":
      return {
        headerTitle: "Recycle Cart Screen",
      };
    default:
      return {
        headerTitle: "Home Screen",
      };
  }
};

const AppDrawerNavigator = createDrawerNavigator(
  {
    HomeTabNavigator: {
      screen: HomeTabNavigator,
      navigationOptions: {
        title: "Home Screen",
        drawerIcon: () => <Ionicons name="ios-home" size={24} />,
      },
    },
    UserProfileScreen: {
      screen: UserProfileScreen,
      navigationOptions: {
        title: "User Profile",
        drawerIcon: () => <Ionicons name="ios-person" size={24} />,
      },
    },
    SettingsScreen: {
      screen: SettingScreen,
      navigationOptions: {
        title: "Settings",
        drawerIcon: () => <Ionicons name="ios-settings" size={24} />,
      },
    },
  },
  {
    contentComponent: CustomDrawerNavigator,
  }
);

const AppSwitchNavigator = createSwitchNavigator({
  SecurityCheck,
  LoginStackNavigator,
  AppDrawerNavigator,
});

const AppContainer = createAppContainer(AppSwitchNavigator);

export default App;
