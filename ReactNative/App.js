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

import WelcomeScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import SettingScreen from "./screens/SettingScreen";
import SecurityCheck from "./screens/AppSwitchNavigator/SecurityCheck";

import {
  createAppContainer,
  createSwitchNavigator,
  createStackNavigator,
  createDrawerNavigator,
  createBottomTabNavigator,
  DrawerItems,
} from "react-navigation";

import CustomDrawerNavigator from "./screens/DrawerNavigator/CustomDrawerNavigator";

import colors from "./assets/colors";
import { Ionicons } from "@expo/vector-icons";

import * as firebase from "firebase/app";
import { firebaseConfig } from "./config/config";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.initializeFirebase();
  }
  initializeFirebase = () => {
    firebase.initializeApp(firebaseConfig);
  };

  signOut = async () => {
    try {
      await firebase.auth().signOut();
      this.props.navigation.navigate("HomeScreen");
    } catch (error) {
      alert("Unable to sign out right now");
    }
  };

  render() {
    return <AppContainer />;
  }
}

const LoginStackNavigator = createStackNavigator({
  WelcomeScreen: {
    screen: WelcomeScreen,
    navigationOptions: {
      header: null,
    },
  },
  SignUpScreen: {
    screen: SignUpScreen,
  },
});

const AppDrawerNavigator = createDrawerNavigator(
  {
    HomeScreen: {
      screen: HomeScreen,
      navigationOptions: {
        title: "Home",
        drawerIcon: () => <Ionicons name="ios-home" size={24} />,
      },
    },
    UserProfileScreen: {
      screen: UserProfileScreen,
      navigationOptions: {
        title: "Settings",
        drawerIcon: () => <Ionicons name="ios-user" size={24} />,
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

/* contentComponent: (props) => (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <SafeAreaView forceInset={{ top: "always", horizontal: "never" }}>
          <DrawerItems {...props} />
          <TouchableOpacity
            onPress={() => {
              this.props.signOut();
            }}
          >
            <Ionicons name="ios-log-out" size={24} />
            <Text
              style={{
                margin: 16,
                fontWeight: "bold",
                color: colors.textColor,
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    ),
    drawerOpenRoute: "DrawerOpen",
    drawerCloseRoute: "DrawerClose",
    drawerToggleRoute: "DrawerToggle",*/
