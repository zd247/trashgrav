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
    if (!firebase.apps.length) {
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

export default App;
